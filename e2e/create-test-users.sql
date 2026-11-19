-- Creates two temporary, already-confirmed test users for e2e/stage2.cjs.
-- Replace TEST_PASSWORD_HERE, run in the Supabase SQL editor (or via the Supabase connection),
-- and delete the users afterwards with e2e/delete-test-users.sql.
do $$
declare u record;
begin
  for u in select * from (values
    ('aaaaaaaa-0000-4000-8000-000000000001'::uuid, 'e2e-student@100bephysics.test', 'highschool'),
    ('aaaaaaaa-0000-4000-8000-000000000002'::uuid, 'e2e-admin@100bephysics.test', 'mechina')
  ) as t(id, email, track)
  loop
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
      extensions.crypt('TEST_PASSWORD_HERE', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('terms_accepted', true, 'track', u.track), now(), now(),
      '', '', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
    values (gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now());
  end loop;
  update public.profiles set role = 'admin' where id = 'aaaaaaaa-0000-4000-8000-000000000002';
end $$;
