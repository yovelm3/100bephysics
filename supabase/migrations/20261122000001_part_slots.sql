-- A part that asks for several numbers (e.g. "the speed at 0.02, 0.04 and 0.08 s") is stored as several rows
-- with the same label, one per number ("slot"). Each slot is checked on its own; the student sees one part.
alter table public.exercise_parts add column if not exists slot text;
