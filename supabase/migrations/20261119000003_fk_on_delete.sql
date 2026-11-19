-- Deleting a user who granted a subscription (an admin) or a payment row must not be blocked.
-- The subscription itself stays; only the reference is cleared.

alter table public.subscriptions drop constraint subscriptions_granted_by_fkey;
alter table public.subscriptions add constraint subscriptions_granted_by_fkey
  foreign key (granted_by) references public.profiles (id) on delete set null;

alter table public.subscriptions drop constraint subscriptions_payment_id_fkey;
alter table public.subscriptions add constraint subscriptions_payment_id_fkey
  foreign key (payment_id) references public.payments (id) on delete set null;
