-- Stage 2: accounts, devices, subscriptions, payments.
-- All writes from students go through SECURITY DEFINER functions.
-- Tables only expose SELECT policies to normal users (RLS).


-- ---------------------------------------------------------------- types
create type public.user_role as enum ('student', 'admin');

-- ---------------------------------------------------------------- tables
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role public.user_role not null default 'student',
  locked boolean not null default false,
  locked_at timestamptz,
  terms_accepted_at timestamptz,
  daily_chat_limit integer not null default 30,
  created_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  device_key text not null,
  browser text,
  os text,
  user_agent text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (user_id, device_key)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product text not null check (product in ('subscription_3m', 'help_request')),
  amount_agorot integer not null check (amount_agorot >= 0),
  currency text not null default 'ILS',
  provider text not null,
  provider_ref text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  source text not null check (source in ('manual', 'payment')),
  granted_by uuid references public.profiles (id),
  payment_id uuid references public.payments (id),
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index devices_user_idx on public.devices (user_id);
create index subscriptions_user_idx on public.subscriptions (user_id, ends_at desc);
create index payments_user_idx on public.payments (user_id);

-- ---------------------------------------------------------------- helpers
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.subscription_ends_at(p_user uuid default auth.uid())
returns timestamptz
language sql stable security definer set search_path = ''
as $$
  select max(ends_at) from public.subscriptions
  where user_id = p_user and starts_at <= now()
    and (p_user = auth.uid() or public.is_admin());
$$;

-- True when the current user may see paid content: not locked and an active subscription.
-- Admins always have access.
create or replace function public.has_access()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((
    select case
      when p.role = 'admin' then true
      when p.locked then false
      else coalesce(public.subscription_ends_at(p.id) > now(), false)
    end
    from public.profiles p where p.id = auth.uid()
  ), false);
$$;

-- ---------------------------------------------------------------- new user -> profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, terms_accepted_at)
  values (
    new.id,
    coalesce(new.email, ''),
    case when (new.raw_user_meta_data ->> 'terms_accepted') = 'true' then now() end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- device limit
-- Registers the current device for the logged-in user.
-- Returns 'ok' or 'locked'. The 6th distinct device locks the account.
-- A locked account stays locked until an admin unlocks it.
create or replace function public.register_device(
  p_device_key text,
  p_browser text default null,
  p_os text default null,
  p_user_agent text default null
)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_locked boolean;
  v_role public.user_role;
  v_count integer;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_device_key is null or p_device_key !~ '^[A-Za-z0-9_-]{16,64}$' then
    raise exception 'invalid device key';
  end if;

  -- Row lock serialises concurrent registrations for the same user.
  select locked, role into v_locked, v_role from public.profiles where id = v_uid for update;
  if not found then
    raise exception 'profile not found';
  end if;

  update public.devices
     set last_seen_at = now(),
         browser = coalesce(left(p_browser, 60), browser),
         os = coalesce(left(p_os, 60), os),
         user_agent = coalesce(left(p_user_agent, 400), user_agent)
   where user_id = v_uid and device_key = p_device_key;

  if found then
    return case when v_locked then 'locked' else 'ok' end;
  end if;

  insert into public.devices (user_id, device_key, browser, os, user_agent)
  values (v_uid, p_device_key, left(p_browser, 60), left(p_os, 60), left(p_user_agent, 400));

  if v_locked then
    return 'locked';
  end if;

  -- Admins are never locked by the device limit (devices are still recorded).
  select count(*) into v_count from public.devices where user_id = v_uid;
  if v_count > 5 and v_role <> 'admin' then
    update public.profiles set locked = true, locked_at = now() where id = v_uid;
    return 'locked';
  end if;

  return 'ok';
end;
$$;

-- ---------------------------------------------------------------- admin actions
create or replace function public.admin_unlock_user(p_user uuid, p_clear_devices boolean default false)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  update public.profiles set locked = false, locked_at = null where id = p_user;
  if p_clear_devices then
    delete from public.devices where user_id = p_user;
  end if;
end;
$$;

create or replace function public.admin_remove_device(p_device uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  delete from public.devices where id = p_device;
end;
$$;

-- Manual subscription: 3 months starting today.
create or replace function public.admin_grant_subscription(p_user uuid)
returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare
  v_end timestamptz := now() + interval '3 months';
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  insert into public.subscriptions (user_id, starts_at, ends_at, source, granted_by)
  values (p_user, now(), v_end, 'manual', auth.uid());
  return v_end;
end;
$$;

-- ---------------------------------------------------------------- payments
-- Marks a pending payment as paid and applies what was bought.
-- Called only by the server with the secret key (never by a student).
-- Idempotent: a payment that is already paid is not applied twice.
create or replace function public.apply_payment(p_payment uuid, p_provider_ref text default null)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_pay public.payments%rowtype;
begin
  select * into v_pay from public.payments where id = p_payment for update;
  if not found then
    raise exception 'payment not found';
  end if;
  if v_pay.status = 'paid' then
    return 'already_paid';
  end if;

  update public.payments
     set status = 'paid', paid_at = now(), provider_ref = coalesce(p_provider_ref, provider_ref)
   where id = p_payment;

  if v_pay.product = 'subscription_3m' then
    insert into public.subscriptions (user_id, starts_at, ends_at, source, payment_id)
    values (v_pay.user_id, now(), now() + interval '3 months', 'payment', p_payment);
  end if;

  return 'applied';
end;
$$;

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

create policy "profiles: own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

create policy "devices: own or admin" on public.devices
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "subscriptions: own or admin" on public.subscriptions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "payments: own or admin" on public.payments
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- No insert/update/delete policies: students cannot change these tables directly.

-- ---------------------------------------------------------------- function permissions
revoke execute on function public.register_device(text, text, text, text) from public, anon;
revoke execute on function public.admin_unlock_user(uuid, boolean) from public, anon;
revoke execute on function public.admin_remove_device(uuid) from public, anon;
revoke execute on function public.admin_grant_subscription(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.subscription_ends_at(uuid) from public, anon;
revoke execute on function public.apply_payment(uuid, text) from public, anon, authenticated;

grant execute on function public.register_device(text, text, text, text) to authenticated;
grant execute on function public.admin_unlock_user(uuid, boolean) to authenticated;
grant execute on function public.admin_remove_device(uuid) to authenticated;
grant execute on function public.admin_grant_subscription(uuid) to authenticated;
grant execute on function public.subscription_ends_at(uuid) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_access() to anon, authenticated;
