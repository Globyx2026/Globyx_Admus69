-- =====================================================================
-- 0004: stricter rules for what visitors can send without an account
-- =====================================================================
-- From the security review of 12 October 2026 (XSS and SQL injection).
--
-- No injection was found: no database function builds SQL from text, and
-- the site never turns stored text into HTML. One weakness was found: the
-- contact form and newsletter accepted any "something@something.something"
-- as an email address, so addresses containing quotes, spaces, angle
-- brackets, ";" or "?" and "&" were stored. They could not run as code,
-- but they do not belong in an email field and could add extra parameters
-- to the admin's "Reply" link. These rules only allow ordinary addresses.
--
-- The constraints are added NOT VALID: Postgres applies them to every new
-- or changed row straight away, without failing on older rows. Check old
-- rows with the query at the bottom, tidy them, then validate.

-- An ordinary email address: letters, digits and . _ % + - before the @,
-- then a domain made of labels separated by dots, ending in 2+ letters.
-- (Kept identical to isValidEmail in src/lib/utils.ts.)

alter table public.contact_messages drop constraint if exists contact_messages_email_check;
alter table public.contact_messages add constraint contact_messages_email_check check (
  char_length(email) between 5 and 160
  and email ~* '^[a-z0-9._%+-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$'
) not valid;

-- The form offers a fixed list of topics; accept only those.
alter table public.contact_messages add constraint contact_messages_topic_allowed check (
  topic in ('Sales', 'Support', 'Billing', 'Partnerships', 'Something else')
) not valid;

alter table public.newsletter_subscribers drop constraint if exists newsletter_subscribers_email_check;
alter table public.newsletter_subscribers add constraint newsletter_subscribers_email_check check (
  email = lower(email)
  and char_length(email) between 5 and 160
  and email ~ '^[a-z0-9._%+-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$'
) not valid;

-- Same rule inside the sign-up function, so a bad address gets the friendly
-- "invalid_email" error instead of a constraint error.
create or replace function public.subscribe_newsletter(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if char_length(v_email) < 5 or char_length(v_email) > 160
     or v_email !~ '^[a-z0-9._%+-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$' then
    raise exception 'invalid_email';
  end if;

  insert into public.newsletter_subscribers (email) values (v_email)
  on conflict (email) do nothing;
end;
$$;

-- Older rows that break the new rules (run by hand; expect none):
--   select 'contact' as source, id::text, email, topic from public.contact_messages
--   where not (email ~* '^[a-z0-9._%+-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$'
--              and topic in ('Sales', 'Support', 'Billing', 'Partnerships', 'Something else'))
--   union all
--   select 'newsletter', null, email, null from public.newsletter_subscribers
--   where email !~ '^[a-z0-9._%+-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$';
-- Then:
--   alter table public.contact_messages validate constraint contact_messages_email_check;
--   alter table public.contact_messages validate constraint contact_messages_topic_allowed;
--   alter table public.newsletter_subscribers validate constraint newsletter_subscribers_email_check;
