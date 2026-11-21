-- Owner review: an admin publishes (or returns to draft) one exercise from the site.
create or replace function public.admin_set_exercise_status(p_id text, p_status public.content_status)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  update public.exercises
     set status = p_status, needs_review = (p_status = 'draft'), updated_at = now()
   where id = p_id;
  if not found then
    raise exception 'not found';
  end if;
end;
$$;

revoke execute on function public.admin_set_exercise_status(text, public.content_status) from public, anon;
grant execute on function public.admin_set_exercise_status(text, public.content_status) to authenticated;
