-- Stage 3A: exercise content, track filtering, free trial, catalog.
-- Students never read correct answers or solutions from tables: those live in part_answers,
-- which only the server (service_role) can read. Solutions are served by get_solution().

create type public.pool as enum ('bagrut', 'mechina');
create type public.content_status as enum ('draft', 'published');
create type public.answer_type as enum ('number', 'choice', 'open');

-- ---------------------------------------------------------------- topic tree
create table public.topics (
  id text primary key,
  name text not null,
  position integer not null
);

create table public.subtopics (
  id text primary key,
  topic_id text not null references public.topics (id) on delete cascade,
  name text not null,
  position integer not null
);

-- Question groups and their names are set by the owner only.
create table public.question_groups (
  id uuid primary key default gen_random_uuid(),
  subtopic_id text not null references public.subtopics (id) on delete cascade,
  name text not null,
  author_note text,
  position integer not null default 0
);

-- ---------------------------------------------------------------- exercises
create table public.exercises (
  id text primary key,                         -- stable slug, e.g. bagrut-1987-q1
  pool public.pool not null,
  open_to_highschool boolean not null default false,
  source_year integer,
  source_label text,                           -- e.g. "1987 שאלה 1"; shown only for bagrut
  subtopic_id text not null references public.subtopics (id),
  group_id uuid references public.question_groups (id) on delete set null,
  difficulty smallint not null check (difficulty between 1 and 5),
  status public.content_status not null default 'draft',
  needs_review boolean not null default false,
  review_notes text,
  stem text not null,
  figure jsonb,
  author_note text,
  concepts text[] not null default '{}',
  summary text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (pool = 'mechina' or not open_to_highschool),
  check (not open_to_highschool or difficulty >= 4)
);

create table public.exercise_parts (
  id text primary key,                         -- exercise id + "-" + position
  exercise_id text not null references public.exercises (id) on delete cascade,
  position integer not null,
  label text not null,                         -- א, ב, ג ...
  question text not null,
  answer_type public.answer_type not null,
  unit text,
  choices jsonb,                               -- for multiple choice: ["...", "..."]
  skills text[] not null default '{}',
  animation jsonb,
  unique (exercise_id, position)
);

create table public.part_answers (
  part_id text primary key references public.exercise_parts (id) on delete cascade,
  correct_value double precision,
  correct_choice integer,
  tolerance_pct numeric,                       -- null = exact check by significant figures
  final_answer text,
  solution jsonb not null default '[]'
);

create table public.trial_unlocks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id text not null references public.exercises (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create index subtopics_topic_idx on public.subtopics (topic_id);
create index question_groups_subtopic_idx on public.question_groups (subtopic_id);
create index exercises_subtopic_idx on public.exercises (subtopic_id);
create index exercises_group_idx on public.exercises (group_id);
create index exercise_parts_exercise_idx on public.exercise_parts (exercise_id);
create index trial_unlocks_exercise_idx on public.trial_unlocks (exercise_id);

-- ---------------------------------------------------------------- visibility rules
-- Which published exercises a track may see at all (before subscription checks).
create or replace function public.visible_to_track(p_pool public.pool, p_open boolean, p_status public.content_status, p_track public.track)
returns boolean
language sql immutable
as $$
  select p_status = 'published'
     and (p_pool = 'bagrut' or (p_pool = 'mechina' and (p_track = 'mechina' or p_open)));
$$;

-- May the current user open this exercise's full content?
create or replace function public.can_view_exercise(p_id text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select case
    when auth.uid() is null then false
    when public.is_admin() then exists (select 1 from public.exercises where id = p_id)
    else exists (
      select 1
      from public.exercises e
      join public.profiles p on p.id = auth.uid()
      where e.id = p_id
        and not p.locked
        and public.visible_to_track(e.pool, e.open_to_highschool, e.status, p.track)
        and (
          public.has_access()
          or exists (select 1 from public.trial_unlocks t where t.user_id = p.id and t.exercise_id = e.id)
        )
    )
  end;
$$;

-- Free trial: a registered user without a subscription may open 2 exercises of their choice.
-- Returns: 'ok' (unlocked now or before), 'subscribed', 'limit', 'not_found', 'locked'.
create or replace function public.unlock_trial(p_id text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_ex public.exercises%rowtype;
  v_used integer;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  select * into v_profile from public.profiles where id = v_uid for update;
  if not found then
    raise exception 'profile not found';
  end if;
  if v_profile.locked then
    return 'locked';
  end if;
  select * into v_ex from public.exercises where id = p_id;
  if not found or not public.visible_to_track(v_ex.pool, v_ex.open_to_highschool, v_ex.status, v_profile.track) then
    return 'not_found';
  end if;
  if public.has_access() then
    return 'subscribed';
  end if;
  if exists (select 1 from public.trial_unlocks where user_id = v_uid and exercise_id = p_id) then
    return 'ok';
  end if;
  select count(*) into v_used from public.trial_unlocks where user_id = v_uid;
  if v_used >= 2 then
    return 'limit';
  end if;
  insert into public.trial_unlocks (user_id, exercise_id) values (v_uid, p_id);
  return 'ok';
end;
$$;

create or replace function public.trial_remaining()
returns integer
language sql stable security definer set search_path = ''
as $$
  select greatest(0, 2 - count(*))::integer from public.trial_unlocks where user_id = auth.uid();
$$;

-- Topic tree with the number of published exercises the given track can see.
-- Logged-in students always get their own track (they cannot ask about another one).
create or replace function public.catalog(p_track public.track default 'highschool')
returns table (topic_id text, topic_name text, topic_position integer, subtopic_id text, subtopic_name text, subtopic_position integer, exercise_count integer)
language sql stable security definer set search_path = ''
as $$
  with t as (
    select case
      when auth.uid() is not null and not public.is_admin() then coalesce(public.my_track(), 'highschool'::public.track)
      else coalesce(p_track, 'highschool'::public.track)
    end as track
  )
  select tp.id, tp.name, tp.position, s.id, s.name, s.position,
         (select count(*)::integer from public.exercises e, t
           where e.subtopic_id = s.id and public.visible_to_track(e.pool, e.open_to_highschool, e.status, t.track))
  from public.topics tp
  join public.subtopics s on s.topic_id = tp.id
  order by tp.position, s.position;
$$;

-- Exercise list of a subtopic for a logged-in user: metadata only, never content.
create or replace function public.list_exercises(p_subtopic text)
returns table (id text, source_label text, difficulty smallint, sort_order integer, unlocked boolean)
language sql stable security definer set search_path = ''
as $$
  select e.id,
         case when e.pool = 'bagrut' then e.source_label end,
         case when e.pool = 'mechina' and e.open_to_highschool and p.track = 'highschool' then greatest(e.difficulty, 4)::smallint else e.difficulty end,
         e.position,
         public.can_view_exercise(e.id)
  from public.exercises e
  join public.profiles p on p.id = auth.uid()
  where e.subtopic_id = p_subtopic
    and (public.is_admin() or (not p.locked and public.visible_to_track(e.pool, e.open_to_highschool, e.status, p.track)))
  order by e.difficulty, e.position, e.id;
$$;

-- Full solution of a part, only for users who may view the exercise.
create or replace function public.get_solution(p_part text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('solution', a.solution, 'final_answer', a.final_answer)
  from public.part_answers a
  join public.exercise_parts pt on pt.id = a.part_id
  where a.part_id = p_part and public.can_view_exercise(pt.exercise_id);
$$;

-- ---------------------------------------------------------------- RLS
alter table public.topics enable row level security;
alter table public.subtopics enable row level security;
alter table public.question_groups enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_parts enable row level security;
alter table public.part_answers enable row level security;
alter table public.trial_unlocks enable row level security;

create policy "topics: everyone" on public.topics for select to anon, authenticated using (true);
create policy "subtopics: everyone" on public.subtopics for select to anon, authenticated using (true);
create policy "groups: logged in" on public.question_groups for select to authenticated using (true);
create policy "exercises: viewable" on public.exercises for select to authenticated using (public.can_view_exercise(id));
create policy "parts: viewable" on public.exercise_parts for select to authenticated using (public.can_view_exercise(exercise_id));
create policy "trial: own or admin" on public.trial_unlocks for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
-- part_answers: no policy and no grant for students. Only the server reads it.

grant select on public.topics, public.subtopics to anon, authenticated;
grant select on public.question_groups, public.exercises, public.exercise_parts, public.trial_unlocks to authenticated;
grant select, insert, update, delete on public.topics, public.subtopics, public.question_groups, public.exercises,
  public.exercise_parts, public.part_answers, public.trial_unlocks to service_role;

revoke execute on function public.can_view_exercise(text) from public, anon;
revoke execute on function public.unlock_trial(text) from public, anon;
revoke execute on function public.trial_remaining() from public, anon;
revoke execute on function public.list_exercises(text) from public, anon;
revoke execute on function public.get_solution(text) from public, anon;
grant execute on function public.can_view_exercise(text) to authenticated;
grant execute on function public.unlock_trial(text) to authenticated;
grant execute on function public.trial_remaining() to authenticated;
grant execute on function public.list_exercises(text) to authenticated;
grant execute on function public.get_solution(text) to authenticated;
grant execute on function public.catalog(public.track) to anon, authenticated;
grant execute on function public.visible_to_track(public.pool, boolean, public.content_status, public.track) to anon, authenticated;
