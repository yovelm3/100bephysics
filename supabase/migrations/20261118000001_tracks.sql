-- Track: high school (בגרות) or mechina. Chosen at signup; only an admin can change it later.

create type public.track as enum ('highschool', 'mechina');

alter table public.profiles add column track public.track not null default 'highschool';

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, terms_accepted_at, track)
  values (
    new.id,
    coalesce(new.email, ''),
    case when (new.raw_user_meta_data ->> 'terms_accepted') = 'true' then now() end,
    case when (new.raw_user_meta_data ->> 'track') = 'mechina' then 'mechina'::public.track
         else 'highschool'::public.track end
  );
  return new;
end;
$$;

create or replace function public.admin_set_track(p_user uuid, p_track public.track)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  update public.profiles set track = p_track where id = p_user;
end;
$$;

-- The current user's track (used by content policies in stage 3).
create or replace function public.my_track()
returns public.track
language sql stable security definer set search_path = ''
as $$
  select track from public.profiles where id = auth.uid();
$$;

revoke execute on function public.admin_set_track(uuid, public.track) from public, anon;
grant execute on function public.admin_set_track(uuid, public.track) to authenticated;
revoke execute on function public.my_track() from public, anon;
grant execute on function public.my_track() to authenticated;
