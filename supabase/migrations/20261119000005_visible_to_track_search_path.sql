-- Security advisor: pin the search path of visible_to_track (same logic as before).
create or replace function public.visible_to_track(p_pool public.pool, p_open boolean, p_status public.content_status, p_track public.track)
returns boolean
language sql immutable set search_path = ''
as $$
  select p_status = 'published'
     and (p_pool = 'bagrut' or (p_pool = 'mechina' and (p_track = 'mechina' or p_open)));
$$;
