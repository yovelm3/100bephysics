-- Performance (Supabase advisor): evaluate auth.uid()/is_admin() once per query, not once per row,
-- and index the remaining foreign keys. Same rules as before.

drop policy "profiles: own or admin" on public.profiles;
create policy "profiles: own or admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));

drop policy "devices: own or admin" on public.devices;
create policy "devices: own or admin" on public.devices
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy "subscriptions: own or admin" on public.subscriptions;
create policy "subscriptions: own or admin" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy "payments: own or admin" on public.payments;
create policy "payments: own or admin" on public.payments
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));

create index if not exists subscriptions_granted_by_idx on public.subscriptions (granted_by);
create index if not exists subscriptions_payment_idx on public.subscriptions (payment_id);
