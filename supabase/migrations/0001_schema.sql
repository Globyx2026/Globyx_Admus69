-- =====================================================================
-- Globyx database, migration 0001: tables, security rules and functions
--
-- Run once on a new Supabase project (SQL editor, or `supabase db push`).
-- Everything is inside one transaction: if any statement fails, nothing
-- is created.
--
-- How access works
--   * Every table has row level security switched on.
--   * Customers can READ their own rows. They cannot write to the wallet,
--     transactions, numbers, proxy plans or API keys directly.
--   * Money only moves inside the functions at the bottom of this file,
--     which check the signed-in user, the price and the balance on the
--     server. The browser is never trusted with a price.
--
-- TEST MODE
--   `top_up_wallet_test` adds funds without taking a payment, and numbers,
--   messages and proxy credentials are simulated. Before taking real
--   customers, replace that function with a payment-provider webhook and
--   connect a number provider and a proxy provider.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Customer profile (one row per account, created automatically)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '' check (char_length(full_name) <= 80),
  company     text not null default '' check (char_length(company) <= 80),
  currency    text not null default 'USD' check (currency in ('USD', 'KES')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Wallet: one balance per account, in US cents
-- ---------------------------------------------------------------------
create table public.wallets (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  balance_cents  bigint not null default 0 check (balance_cents >= 0),
  updated_at     timestamptz not null default now()
);

-- Every movement of money. Positive amounts are credits, negative are debits.
create table public.transactions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  kind                 text not null check (kind in ('topup', 'number', 'renewal', 'proxy', 'refund')),
  amount_cents         bigint not null,
  balance_after_cents  bigint not null,
  method               text check (method in ('card', 'mpesa', 'crypto')),
  description          text not null,
  created_at           timestamptz not null default now()
);
create index transactions_user_created_idx on public.transactions (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Number inventory (what is for sale) and rented numbers
-- ---------------------------------------------------------------------
create table public.number_catalog (
  id             text primary key,
  country_code   text not null check (country_code ~ '^[A-Z]{2}$'),
  city           text not null,
  type           text not null check (type in ('local', 'mobile', 'tollfree')),
  number         text not null unique,   -- full number: only shown to the customer who rents it
  masked         text not null,          -- middle digits hidden: shown in the public catalogue
  sms            boolean not null default true,
  voice          boolean not null default true,
  mms            boolean not null default false,
  monthly_cents  integer not null check (monthly_cents > 0),
  setup_cents    integer not null default 0 check (setup_cents >= 0),
  popularity     integer not null default 50,
  added_at       timestamptz not null default now(),
  status         text not null default 'available' check (status in ('available', 'rented'))
);
create index number_catalog_browse_idx on public.number_catalog (status, country_code, type);

create table public.numbers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  catalog_id     text not null references public.number_catalog (id),
  number         text not null,
  country_code   text not null,
  city           text not null,
  type           text not null,
  sms            boolean not null,
  voice          boolean not null,
  mms            boolean not null,
  monthly_cents  integer not null,
  label          text not null default '' check (char_length(label) <= 40),
  status         text not null default 'active' check (status in ('active', 'released')),
  purchased_at   timestamptz not null default now(),
  renews_at      timestamptz not null,
  released_at    timestamptz
);
create index numbers_user_idx on public.numbers (user_id, purchased_at desc);
-- A number can be rented by one customer at a time.
create unique index numbers_one_active_rental_idx on public.numbers (catalog_id) where status = 'active';

-- Text messages received on a rented number.
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  number_id    uuid not null references public.numbers (id) on delete cascade,
  sender       text not null,
  body         text not null check (char_length(body) <= 1600),
  received_at  timestamptz not null default now(),
  read_at      timestamptz
);
create index messages_number_idx on public.messages (number_id, received_at desc);
create index messages_user_idx on public.messages (user_id);

-- ---------------------------------------------------------------------
-- Proxies: the rate card and what each customer has bought
-- ---------------------------------------------------------------------
create table public.proxy_rates (
  kind          text not null check (kind in ('residential', 'mobile', 'isp', 'datacenter')),
  min_quantity  integer not null check (min_quantity >= 1),
  unit_cents    integer not null check (unit_cents > 0),
  primary key (kind, min_quantity)
);

create table public.proxy_plans (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  kind          text not null check (kind in ('residential', 'mobile', 'isp', 'datacenter')),
  unit          text not null check (unit in ('gb', 'ip')),
  quantity      integer not null check (quantity >= 1),
  used_mb       bigint not null default 0 check (used_mb >= 0),
  price_cents   bigint not null,
  host          text not null,
  port          integer not null,
  username      text not null,
  password      text not null,
  purchased_at  timestamptz not null default now(),
  expires_at    timestamptz not null
);
create index proxy_plans_user_idx on public.proxy_plans (user_id, purchased_at desc);

-- ---------------------------------------------------------------------
-- API keys. Only a hash of the key is stored; the key is shown once.
-- ---------------------------------------------------------------------
create table public.api_keys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  prefix      text not null,
  key_hash    text not null unique,
  created_at  timestamptz not null default now(),
  revoked_at  timestamptz
);
create index api_keys_user_idx on public.api_keys (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Public forms
-- ---------------------------------------------------------------------
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete set null,
  name        text not null check (char_length(name) between 2 and 80),
  email       text not null check (char_length(email) between 5 and 160 and email like '%_@_%._%'),
  topic       text not null check (char_length(topic) between 1 and 60),
  message     text not null check (char_length(message) between 10 and 4000),
  created_at  timestamptz not null default now()
);
create index contact_messages_user_idx on public.contact_messages (user_id);

create table public.newsletter_subscribers (
  email       text primary key check (email = lower(email) and char_length(email) between 5 and 160 and email like '%_@_%._%'),
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- Security: start from nothing, then grant exactly what is needed
-- =====================================================================
revoke all on table
  public.profiles, public.wallets, public.transactions, public.number_catalog, public.numbers,
  public.messages, public.proxy_rates, public.proxy_plans, public.api_keys,
  public.contact_messages, public.newsletter_subscribers
from anon, authenticated;

alter table public.profiles               enable row level security;
alter table public.wallets                enable row level security;
alter table public.transactions           enable row level security;
alter table public.number_catalog         enable row level security;
alter table public.numbers                enable row level security;
alter table public.messages               enable row level security;
alter table public.proxy_rates            enable row level security;
alter table public.proxy_plans            enable row level security;
alter table public.api_keys               enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Profile: read your own, change your own name, company and currency.
grant select on public.profiles to authenticated;
grant update (full_name, company, currency) on public.profiles to authenticated;
create policy "Customers read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Customers update their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Wallet and transactions: read only.
grant select on public.wallets to authenticated;
create policy "Customers read their own wallet" on public.wallets
  for select to authenticated using ((select auth.uid()) = user_id);

grant select on public.transactions to authenticated;
create policy "Customers read their own transactions" on public.transactions
  for select to authenticated using ((select auth.uid()) = user_id);

-- Catalogue: anyone may browse available numbers, but never the full number.
grant select (id, country_code, city, type, masked, sms, voice, mms, monthly_cents, setup_cents, popularity, added_at, status)
  on public.number_catalog to anon, authenticated;
create policy "Anyone can browse available numbers" on public.number_catalog
  for select to anon, authenticated using (status = 'available');

-- Rented numbers: read your own, rename your own.
grant select on public.numbers to authenticated;
grant update (label) on public.numbers to authenticated;
create policy "Customers read their own numbers" on public.numbers
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Customers rename their own numbers" on public.numbers
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Messages: read your own, mark them read, delete them.
grant select, delete on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;
create policy "Customers read their own messages" on public.messages
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Customers mark their own messages read" on public.messages
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Customers delete their own messages" on public.messages
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Proxy rate card is public. Purchased plans are private.
grant select on public.proxy_rates to anon, authenticated;
create policy "Anyone can read proxy rates" on public.proxy_rates
  for select to anon, authenticated using (true);

grant select on public.proxy_plans to authenticated;
create policy "Customers read their own proxy plans" on public.proxy_plans
  for select to authenticated using ((select auth.uid()) = user_id);

-- API keys: the hash column is never readable from the browser.
grant select (id, user_id, name, prefix, created_at, revoked_at) on public.api_keys to authenticated;
create policy "Customers read their own API keys" on public.api_keys
  for select to authenticated using ((select auth.uid()) = user_id);

-- Contact form: anyone may send a message; nobody can read them from the
-- browser. Read them in the Supabase table editor.
grant insert (name, email, topic, message) on public.contact_messages to anon, authenticated;
create policy "Anyone can send a contact message" on public.contact_messages
  for insert to anon, authenticated with check (char_length(message) >= 10);

-- newsletter_subscribers has no grants and no policies on purpose: it is
-- written only by subscribe_newsletter() below.

-- =====================================================================
-- Triggers
-- =====================================================================

-- Give every new account a profile and an empty wallet.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80))
  on conflict (id) do nothing;

  insert into public.wallets (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts that existed before this migration.
insert into public.profiles (id, full_name)
select id, left(coalesce(raw_user_meta_data ->> 'full_name', ''), 80) from auth.users
on conflict (id) do nothing;
insert into public.wallets (user_id) select id from auth.users on conflict (user_id) do nothing;

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Store who sent a contact message when they were signed in.
create function public.stamp_contact_message()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.user_id := auth.uid();
  new.created_at := now();
  return new;
end;
$$;

create trigger contact_messages_stamp
  before insert on public.contact_messages
  for each row execute function public.stamp_contact_message();

-- If an account is deleted, its active numbers go back on sale.
create function public.return_number_to_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'active' then
    update public.number_catalog set status = 'available' where id = old.catalog_id;
  end if;
  return old;
end;
$$;

create trigger numbers_return_to_catalog
  after delete on public.numbers
  for each row execute function public.return_number_to_catalog();

-- =====================================================================
-- Functions the app calls. Each one checks who is signed in.
-- Errors are short codes; the app turns them into friendly messages.
-- =====================================================================

-- TEST MODE top-up: credits the wallet WITHOUT taking a payment.
-- Replace with a payment-provider webhook before launch.
create function public.top_up_wallet_test(p_amount_cents integer, p_method text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user     uuid := auth.uid();
  v_balance  bigint;
begin
  if v_user is null then raise exception 'not_signed_in'; end if;
  if p_amount_cents is null or p_amount_cents < 500 or p_amount_cents > 50000 then
    raise exception 'invalid_amount';
  end if;
  if p_method is null or p_method not in ('card', 'mpesa', 'crypto') then
    raise exception 'invalid_method';
  end if;

  -- Test funds are capped at $2,000 per wallet.
  update public.wallets
     set balance_cents = balance_cents + p_amount_cents, updated_at = now()
   where user_id = v_user and balance_cents + p_amount_cents <= 200000
  returning balance_cents into v_balance;
  if not found then raise exception 'balance_cap'; end if;

  insert into public.transactions (user_id, kind, amount_cents, balance_after_cents, method, description)
  values (v_user, 'topup', p_amount_cents, v_balance, p_method,
          'Wallet top-up (test mode, ' ||
          case p_method when 'card' then 'card' when 'mpesa' then 'M-Pesa' else 'crypto' end || ')');

  return v_balance;
end;
$$;

-- Rent a number from the catalogue: first month plus any setup fee.
create function public.rent_number(p_catalog_id text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user     uuid := auth.uid();
  v_item     public.number_catalog%rowtype;
  v_cost     bigint;
  v_balance  bigint;
  v_id       uuid;
begin
  if v_user is null then raise exception 'not_signed_in'; end if;

  if (select count(*) from public.numbers where user_id = v_user and status = 'active') >= 10 then
    raise exception 'number_limit';
  end if;

  select * into v_item from public.number_catalog where id = p_catalog_id for update;
  if not found or v_item.status <> 'available' then raise exception 'number_unavailable'; end if;

  v_cost := v_item.monthly_cents + v_item.setup_cents;

  update public.wallets
     set balance_cents = balance_cents - v_cost, updated_at = now()
   where user_id = v_user and balance_cents >= v_cost
  returning balance_cents into v_balance;
  if not found then raise exception 'insufficient_funds'; end if;

  update public.number_catalog set status = 'rented' where id = v_item.id;

  insert into public.numbers (user_id, catalog_id, number, country_code, city, type, sms, voice, mms, monthly_cents, renews_at)
  values (v_user, v_item.id, v_item.number, v_item.country_code, v_item.city, v_item.type,
          v_item.sms, v_item.voice, v_item.mms, v_item.monthly_cents, now() + interval '1 month')
  returning id into v_id;

  insert into public.transactions (user_id, kind, amount_cents, balance_after_cents, description)
  values (v_user, 'number', -v_cost, v_balance,
          'Number ' || v_item.number || ': first month' ||
          case when v_item.setup_cents > 0 then ' and setup fee' else '' end);

  return v_id;
end;
$$;

-- Pay for one more month on a number you rent.
create function public.renew_number(p_number_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user     uuid := auth.uid();
  v_number   public.numbers%rowtype;
  v_balance  bigint;
  v_until    timestamptz;
begin
  if v_user is null then raise exception 'not_signed_in'; end if;

  select * into v_number from public.numbers
   where id = p_number_id and user_id = v_user and status = 'active' for update;
  if not found then raise exception 'number_not_found'; end if;

  -- At most three months can be paid ahead.
  if v_number.renews_at > now() + interval '2 months' then raise exception 'renewal_limit'; end if;

  update public.wallets
     set balance_cents = balance_cents - v_number.monthly_cents, updated_at = now()
   where user_id = v_user and balance_cents >= v_number.monthly_cents
  returning balance_cents into v_balance;
  if not found then raise exception 'insufficient_funds'; end if;

  v_until := greatest(v_number.renews_at, now()) + interval '1 month';
  update public.numbers set renews_at = v_until where id = v_number.id;

  insert into public.transactions (user_id, kind, amount_cents, balance_after_cents, description)
  values (v_user, 'renewal', -v_number.monthly_cents, v_balance, 'Number ' || v_number.number || ': one more month');

  return v_until;
end;
$$;

-- Give a number back. It returns to the catalogue; nothing is refunded.
create function public.release_number(p_number_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user     uuid := auth.uid();
  v_catalog  text;
begin
  if v_user is null then raise exception 'not_signed_in'; end if;

  update public.numbers
     set status = 'released', released_at = now()
   where id = p_number_id and user_id = v_user and status = 'active'
  returning catalog_id into v_catalog;
  if not found then raise exception 'number_not_found'; end if;

  update public.number_catalog set status = 'available' where id = v_catalog;
end;
$$;

-- TEST MODE: put a sample text message in a number's inbox.
create function public.send_test_message(p_number_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user    uuid := auth.uid();
  v_number  public.numbers%rowtype;
  v_id      uuid;
begin
  if v_user is null then raise exception 'not_signed_in'; end if;

  select * into v_number from public.numbers
   where id = p_number_id and user_id = v_user and status = 'active';
  if not found then raise exception 'number_not_found'; end if;
  if not v_number.sms then raise exception 'sms_not_supported'; end if;

  if (select count(*) from public.messages where number_id = v_number.id) >= 50 then
    raise exception 'inbox_full';
  end if;

  insert into public.messages (user_id, number_id, sender, body)
  values (v_user, v_number.id, 'Globyx',
          'Test message for ' || v_number.number || '. Your inbox is working. ' ||
          'Real messages will arrive here once a carrier is connected.')
  returning id into v_id;

  return v_id;
end;
$$;

-- Buy proxy access for 30 days. The price comes from proxy_rates, never
-- from the browser. Residential and mobile are sold per GB, ISP and
-- datacenter per IP address.
create function public.buy_proxy_plan(p_kind text, p_quantity integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user     uuid := auth.uid();
  v_unit     text;
  v_max      integer;
  v_port     integer;
  v_label    text;
  v_rate     integer;
  v_cost     bigint;
  v_balance  bigint;
  v_id       uuid;
begin
  if v_user is null then raise exception 'not_signed_in'; end if;

  case p_kind
    when 'residential' then v_unit := 'gb'; v_max := 1000; v_port := 7000; v_label := 'Residential';
    when 'mobile'      then v_unit := 'gb'; v_max := 1000; v_port := 7100; v_label := 'Mobile';
    when 'isp'         then v_unit := 'ip'; v_max := 100;  v_port := 7200; v_label := 'ISP static';
    when 'datacenter'  then v_unit := 'ip'; v_max := 100;  v_port := 7300; v_label := 'Datacenter';
    else raise exception 'invalid_product';
  end case;

  if p_quantity is null or p_quantity < 1 or p_quantity > v_max then raise exception 'invalid_quantity'; end if;

  if (select count(*) from public.proxy_plans where user_id = v_user and expires_at > now()) >= 20 then
    raise exception 'plan_limit';
  end if;

  select unit_cents into v_rate from public.proxy_rates
   where kind = p_kind and min_quantity <= p_quantity
   order by min_quantity desc limit 1;
  if not found then raise exception 'invalid_product'; end if;

  v_cost := v_rate::bigint * p_quantity;

  update public.wallets
     set balance_cents = balance_cents - v_cost, updated_at = now()
   where user_id = v_user and balance_cents >= v_cost
  returning balance_cents into v_balance;
  if not found then raise exception 'insufficient_funds'; end if;

  insert into public.proxy_plans (user_id, kind, unit, quantity, price_cents, host, port, username, password, expires_at)
  values (v_user, p_kind, v_unit, p_quantity, v_cost, 'gate.globyx.com', v_port,
          'gbx_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
          substr(replace(gen_random_uuid()::text, '-', ''), 1, 20),
          now() + interval '30 days')
  returning id into v_id;

  insert into public.transactions (user_id, kind, amount_cents, balance_after_cents, description)
  values (v_user, 'proxy', -v_cost, v_balance,
          v_label || ' proxies: ' || p_quantity || case v_unit when 'gb' then ' GB' else ' IP' || case when p_quantity > 1 then 's' else '' end end || ', 30 days');

  return v_id;
end;
$$;

-- Create an API key. The full key is returned once and never stored.
create function public.create_api_key(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user  uuid := auth.uid();
  v_name  text := btrim(coalesce(p_name, ''));
  v_key   text;
begin
  if v_user is null then raise exception 'not_signed_in'; end if;
  if char_length(v_name) < 1 or char_length(v_name) > 40 then raise exception 'invalid_name'; end if;

  if (select count(*) from public.api_keys where user_id = v_user and revoked_at is null) >= 10 then
    raise exception 'key_limit';
  end if;

  v_key := 'gbx_test_' || replace(gen_random_uuid()::text, '-', '') || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  insert into public.api_keys (user_id, name, prefix, key_hash)
  values (v_user, v_name, left(v_key, 13), encode(sha256(convert_to(v_key, 'UTF8')), 'hex'));

  return v_key;
end;
$$;

create function public.revoke_api_key(p_key_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not_signed_in'; end if;

  update public.api_keys set revoked_at = now()
   where id = p_key_id and user_id = v_user and revoked_at is null;
  if not found then raise exception 'key_not_found'; end if;
end;
$$;

-- Newsletter sign-up. Subscribing twice is harmless, and the reply never
-- reveals whether an address was already on the list.
create function public.subscribe_newsletter(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if char_length(v_email) < 5 or char_length(v_email) > 160 or v_email not like '%_@_%._%' then
    raise exception 'invalid_email';
  end if;

  insert into public.newsletter_subscribers (email) values (v_email)
  on conflict (email) do nothing;
end;
$$;

-- Who may call what. Nothing is callable by default.
revoke all on function
  public.handle_new_user(), public.touch_updated_at(), public.stamp_contact_message(),
  public.return_number_to_catalog(),
  public.top_up_wallet_test(integer, text), public.rent_number(text), public.renew_number(uuid),
  public.release_number(uuid), public.send_test_message(uuid), public.buy_proxy_plan(text, integer),
  public.create_api_key(text), public.revoke_api_key(uuid), public.subscribe_newsletter(text)
from public, anon, authenticated;

grant execute on function
  public.top_up_wallet_test(integer, text), public.rent_number(text), public.renew_number(uuid),
  public.release_number(uuid), public.send_test_message(uuid), public.buy_proxy_plan(text, integer),
  public.create_api_key(text), public.revoke_api_key(uuid)
to authenticated;

grant execute on function public.subscribe_newsletter(text) to anon, authenticated;

-- =====================================================================
-- Proxy rate card (US cents per GB, or per IP address per 30 days)
-- =====================================================================
insert into public.proxy_rates (kind, min_quantity, unit_cents) values
  ('residential', 1, 400), ('residential', 5, 360), ('residential', 25, 320),
  ('residential', 100, 280), ('residential', 250, 240), ('residential', 500, 200),
  ('mobile', 1, 800), ('mobile', 5, 720), ('mobile', 25, 650),
  ('mobile', 100, 580), ('mobile', 250, 520), ('mobile', 500, 460),
  ('isp', 1, 350), ('isp', 10, 320), ('isp', 50, 280),
  ('datacenter', 1, 180), ('datacenter', 10, 150), ('datacenter', 50, 120);

commit;
