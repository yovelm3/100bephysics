-- New Supabase projects do not grant table privileges to the API roles automatically.
-- Grant only what the app needs. RLS still decides which rows each user sees.

grant usage on schema public to anon, authenticated, service_role;

-- Logged-in users may only read (their own rows, per RLS). All writes go through functions.
grant select on public.profiles, public.devices, public.subscriptions, public.payments to authenticated;

-- The server's secret key (cron jobs, payment webhooks) needs full access.
grant select, insert, update, delete on public.profiles, public.devices, public.subscriptions, public.payments to service_role;
