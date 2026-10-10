-- =====================================================================
-- Globyx database, migration 0003: the admin dashboard
--
-- Adds a list of admin accounts and read-only reporting functions for
-- the /admin pages: totals, customers, transactions, rented numbers,
-- proxy plans, contact messages and newsletter sign-ups.
--
-- How access works
--   * `admins` lists the accounts that may use /admin. Nobody can read or
--     change it from the website: admins are added by hand, in the SQL
--     editor, by someone who can sign in to Supabase.
--   * Every admin_* function starts by checking the caller is in that
--     list and raises `not_admin` otherwise. Customers' own access rules
--     are not changed by this file.
--   * The functions are read-only, and never return passwords, API key
--     hashes, proxy passwords or the text of customers' messages.
--
-- To make an account an admin (the person must have signed up first):
--
--   insert into public.admins (user_id)
--   select id from auth.users where lower(email) = lower('you@example.com');
--
-- To remove one:
--
--   delete from public.admins
--   where user_id = (select id from auth.users where lower(email) = lower('you@example.com'));
-- =====================================================================

begin;

create table public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

revoke all on table public.admins from anon, authenticated;
alter table public.admins enable row level security;
-- No grants and no policies on purpose: the table is only read by is_admin().

-- True when the signed-in account is an admin.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Used by every admin function. Keeps page sizes sensible.
create function public.admin_page_size(p_limit integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select least(greatest(coalesce(p_limit, 50), 1), 500);
$$;

-- Headline numbers and a 14-day series of money in and money out (UTC days).
create function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;

  select jsonb_build_object(
    'customers',            (select count(*) from auth.users where not coalesce(is_anonymous, false)),
    'customers_7d',         (select count(*) from auth.users
                              where not coalesce(is_anonymous, false) and created_at > now() - interval '7 days'),
    'demo_accounts',        (select count(*) from auth.users where coalesce(is_anonymous, false)),
    'wallet_total_cents',   (select coalesce(sum(balance_cents), 0) from public.wallets),
    'topups_cents',         (select coalesce(sum(amount_cents), 0) from public.transactions where kind = 'topup'),
    'spend_cents',          (select coalesce(-sum(amount_cents), 0) from public.transactions where amount_cents < 0),
    'spend_numbers_cents',  (select coalesce(-sum(amount_cents), 0) from public.transactions
                              where kind in ('number', 'renewal')),
    'spend_proxies_cents',  (select coalesce(-sum(amount_cents), 0) from public.transactions where kind = 'proxy'),
    'transactions',         (select count(*) from public.transactions),
    'numbers_active',       (select count(*) from public.numbers where status = 'active'),
    'numbers_due',          (select count(*) from public.numbers where status = 'active' and renews_at < now()),
    'numbers_in_stock',     (select count(*) from public.number_catalog where status = 'available'),
    'proxy_plans_active',   (select count(*) from public.proxy_plans where expires_at > now()),
    'proxy_gb_active',      (select coalesce(sum(quantity), 0) from public.proxy_plans
                              where unit = 'gb' and expires_at > now()),
    'proxy_gb_used',        (select coalesce(round(sum(used_mb) / 1024.0, 2), 0) from public.proxy_plans
                              where unit = 'gb' and expires_at > now()),
    'proxy_ips_active',     (select coalesce(sum(quantity), 0) from public.proxy_plans
                              where unit = 'ip' and expires_at > now()),
    'contact_messages',     (select count(*) from public.contact_messages),
    'contact_messages_7d',  (select count(*) from public.contact_messages where created_at > now() - interval '7 days'),
    'subscribers',          (select count(*) from public.newsletter_subscribers),
    'daily', (
      select jsonb_agg(jsonb_build_object(
               'day', to_char(d.day, 'YYYY-MM-DD'),
               'topups_cents', coalesce(t.topups, 0),
               'spend_cents', coalesce(t.spend, 0)) order by d.day)
        from generate_series((now() at time zone 'utc')::date - 13, (now() at time zone 'utc')::date, interval '1 day') as d(day)
        left join (
          select (created_at at time zone 'utc')::date as day,
                 sum(amount_cents) filter (where kind = 'topup') as topups,
                 -sum(amount_cents) filter (where amount_cents < 0) as spend
            from public.transactions
           where created_at > now() - interval '15 days'
           group by 1
        ) t on t.day = d.day::date
    )
  ) into v_result;

  return v_result;
end;
$$;

-- Every customer with their wallet and what they hold.
create function public.admin_list_customers(p_search text default '', p_limit integer default 50)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := '%' || lower(btrim(coalesce(p_search, ''))) || '%';
  v_result jsonb;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;

  with rows as (
    select u.id, u.email, coalesce(u.is_anonymous, false) as is_demo, u.created_at, u.last_sign_in_at,
           coalesce(p.full_name, '') as full_name, coalesce(p.company, '') as company,
           coalesce(w.balance_cents, 0) as balance_cents,
           (select count(*) from public.numbers n where n.user_id = u.id and n.status = 'active') as numbers,
           (select count(*) from public.proxy_plans pp where pp.user_id = u.id and pp.expires_at > now()) as proxy_plans,
           (select coalesce(sum(t.amount_cents), 0) from public.transactions t
             where t.user_id = u.id and t.kind = 'topup') as topups_cents,
           (select coalesce(-sum(t.amount_cents), 0) from public.transactions t
             where t.user_id = u.id and t.amount_cents < 0) as spend_cents,
           exists (select 1 from public.admins a where a.user_id = u.id) as is_admin
      from auth.users u
      left join public.profiles p on p.id = u.id
      left join public.wallets w on w.user_id = u.id
     where lower(coalesce(u.email, '')) like v_search
        or lower(coalesce(p.full_name, '')) like v_search
        or lower(coalesce(p.company, '')) like v_search
  )
  select jsonb_build_object(
           'total', (select count(*) from rows),
           'items', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at desc)
                                from (select * from rows order by created_at desc
                                       limit public.admin_page_size(p_limit)) r), '[]'::jsonb))
    into v_result;

  return v_result;
end;
$$;

-- Every movement of money, newest first. p_kind is '' for all kinds.
create function public.admin_list_transactions(p_search text default '', p_kind text default '', p_limit integer default 50)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := '%' || lower(btrim(coalesce(p_search, ''))) || '%';
  v_kind   text := coalesce(p_kind, '');
  v_result jsonb;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;

  with rows as (
    select t.id, t.created_at, t.kind, t.amount_cents, t.balance_after_cents, t.method, t.description,
           t.user_id, u.email, coalesce(p.full_name, '') as full_name
      from public.transactions t
      join auth.users u on u.id = t.user_id
      left join public.profiles p on p.id = t.user_id
     where (v_kind = '' or t.kind = v_kind)
       and (lower(coalesce(u.email, '')) like v_search
            or lower(coalesce(p.full_name, '')) like v_search
            or lower(t.description) like v_search)
  )
  select jsonb_build_object(
           'total', (select count(*) from rows),
           'sum_cents', (select coalesce(sum(amount_cents), 0) from rows),
           'items', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at desc, r.id)
                                from (select * from rows order by created_at desc, id
                                       limit public.admin_page_size(p_limit)) r), '[]'::jsonb))
    into v_result;

  return v_result;
end;
$$;

-- Every number that has been rented. p_status is '', 'active' or 'released'.
create function public.admin_list_numbers(p_search text default '', p_status text default '', p_limit integer default 50)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := '%' || lower(btrim(coalesce(p_search, ''))) || '%';
  v_status text := coalesce(p_status, '');
  v_result jsonb;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;

  with rows as (
    select n.id, n.number, n.country_code, n.city, n.type, n.monthly_cents, n.label, n.status,
           n.purchased_at, n.renews_at, n.released_at,
           (select count(*) from public.messages m where m.number_id = n.id) as messages,
           n.user_id, u.email, coalesce(p.full_name, '') as full_name
      from public.numbers n
      join auth.users u on u.id = n.user_id
      left join public.profiles p on p.id = n.user_id
     where (v_status = '' or n.status = v_status)
       and (lower(coalesce(u.email, '')) like v_search
            or lower(coalesce(p.full_name, '')) like v_search
            or replace(n.number, ' ', '') like replace(v_search, ' ', '')
            or lower(n.city) like v_search)
  )
  select jsonb_build_object(
           'total', (select count(*) from rows),
           'monthly_cents', (select coalesce(sum(monthly_cents), 0) from rows where status = 'active'),
           'items', coalesce((select jsonb_agg(to_jsonb(r) order by r.purchased_at desc)
                                from (select * from rows order by purchased_at desc
                                       limit public.admin_page_size(p_limit)) r), '[]'::jsonb))
    into v_result;

  return v_result;
end;
$$;

-- Every proxy plan with its balance. p_state is '', 'active' or 'expired'.
-- Proxy passwords are deliberately left out.
create function public.admin_list_proxy_plans(p_search text default '', p_state text default '', p_limit integer default 50)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := '%' || lower(btrim(coalesce(p_search, ''))) || '%';
  v_state  text := coalesce(p_state, '');
  v_result jsonb;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;

  with rows as (
    select pp.id, pp.kind, pp.unit, pp.quantity, pp.used_mb, pp.price_cents, pp.username,
           pp.purchased_at, pp.expires_at, (pp.expires_at > now()) as active,
           pp.user_id, u.email, coalesce(p.full_name, '') as full_name
      from public.proxy_plans pp
      join auth.users u on u.id = pp.user_id
      left join public.profiles p on p.id = pp.user_id
     where (v_state = ''
            or (v_state = 'active' and pp.expires_at > now())
            or (v_state = 'expired' and pp.expires_at <= now()))
       and (lower(coalesce(u.email, '')) like v_search
            or lower(coalesce(p.full_name, '')) like v_search
            or pp.kind like v_search
            or lower(pp.username) like v_search)
  )
  select jsonb_build_object(
           'total', (select count(*) from rows),
           'items', coalesce((select jsonb_agg(to_jsonb(r) order by r.purchased_at desc)
                                from (select * from rows order by purchased_at desc
                                       limit public.admin_page_size(p_limit)) r), '[]'::jsonb))
    into v_result;

  return v_result;
end;
$$;

-- Contact form messages, newest first.
create function public.admin_list_contact_messages(p_search text default '', p_limit integer default 50)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := '%' || lower(btrim(coalesce(p_search, ''))) || '%';
  v_result jsonb;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;

  with rows as (
    select c.id, c.created_at, c.name, c.email, c.topic, c.message
      from public.contact_messages c
     where lower(c.name) like v_search or lower(c.email) like v_search
        or lower(c.topic) like v_search or lower(c.message) like v_search
  )
  select jsonb_build_object(
           'total', (select count(*) from rows),
           'items', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at desc)
                                from (select * from rows order by created_at desc
                                       limit public.admin_page_size(p_limit)) r), '[]'::jsonb))
    into v_result;

  return v_result;
end;
$$;

-- Newsletter sign-ups, newest first.
create function public.admin_list_subscribers(p_search text default '', p_limit integer default 50)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := '%' || lower(btrim(coalesce(p_search, ''))) || '%';
  v_result jsonb;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;

  with rows as (
    select s.email, s.created_at from public.newsletter_subscribers s where s.email like v_search
  )
  select jsonb_build_object(
           'total', (select count(*) from rows),
           'items', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at desc)
                                from (select * from rows order by created_at desc
                                       limit public.admin_page_size(p_limit)) r), '[]'::jsonb))
    into v_result;

  return v_result;
end;
$$;

-- Signed-in accounts may call these; each one refuses anyone who is not an admin.
revoke all on function
  public.is_admin(), public.admin_page_size(integer), public.admin_overview(),
  public.admin_list_customers(text, integer), public.admin_list_transactions(text, text, integer),
  public.admin_list_numbers(text, text, integer), public.admin_list_proxy_plans(text, text, integer),
  public.admin_list_contact_messages(text, integer), public.admin_list_subscribers(text, integer)
from public, anon, authenticated;

grant execute on function
  public.is_admin(), public.admin_overview(),
  public.admin_list_customers(text, integer), public.admin_list_transactions(text, text, integer),
  public.admin_list_numbers(text, text, integer), public.admin_list_proxy_plans(text, text, integer),
  public.admin_list_contact_messages(text, integer), public.admin_list_subscribers(text, integer)
to authenticated;

commit;
