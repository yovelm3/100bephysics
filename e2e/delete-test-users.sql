-- Removes the temporary e2e users (profiles, devices and subscriptions are deleted with them).
delete from auth.users where id in ('aaaaaaaa-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000002');
