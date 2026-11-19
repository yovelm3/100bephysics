-- Every answer attempt and every opened solution is recorded (for progress tracking in stage 4).
-- Written only by the server after it checks the answer; students can read their own rows.

create table public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id text not null references public.exercises (id) on delete cascade,
  part_id text not null references public.exercise_parts (id) on delete cascade,
  kind text not null check (kind in ('answer', 'solution')),
  input text,
  result text check (result in ('correct', 'wrong', 'sign', 'units')),
  created_at timestamptz not null default now(),
  check ((kind = 'answer') = (result is not null))
);

create index attempts_user_part_idx on public.attempts (user_id, part_id, created_at desc);
create index attempts_exercise_idx on public.attempts (exercise_id);
create index attempts_part_idx on public.attempts (part_id);

alter table public.attempts enable row level security;
create policy "attempts: own or admin" on public.attempts
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));

grant select on public.attempts to authenticated;
grant select, insert, update, delete on public.attempts to service_role;

-- Why the current user can or cannot open an exercise (for the exercise page). Reveals nothing about content.
-- 'view' | 'trial_available' | 'trial_used_up' | 'locked' | 'not_found'
create or replace function public.exercise_access(p_id text)
returns text
language sql stable security definer set search_path = ''
as $$
  select case
    when auth.uid() is null then 'not_found'
    when public.can_view_exercise(p_id) then 'view'
    when not exists (
      select 1 from public.exercises e join public.profiles p on p.id = auth.uid()
      where e.id = p_id and public.visible_to_track(e.pool, e.open_to_highschool, e.status, p.track)
    ) then 'not_found'
    when (select locked from public.profiles where id = auth.uid()) then 'locked'
    when public.trial_remaining() > 0 then 'trial_available'
    else 'trial_used_up'
  end;
$$;

revoke execute on function public.exercise_access(text) from public, anon;
grant execute on function public.exercise_access(text) to authenticated;
