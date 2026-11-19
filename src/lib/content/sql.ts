import type { Exercise, Topics } from "./schema";

/** SQL string literal (standard_conforming_strings: only quotes need doubling). */
export function lit(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") {
    if (!Number.isFinite(v)) throw new Error("non-finite number");
    return String(v);
  }
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
}
const json = (v: unknown) => `${lit(JSON.stringify(v))}::jsonb`;
const textArray = (a: string[]) => (a.length ? `array[${a.map(lit).join(", ")}]::text[]` : `'{}'::text[]`);

/** Upserts the topic tree (never deletes topics that may already have exercises). */
export function topicsSql(t: Topics): string {
  const out: string[] = [];
  t.topics.forEach((topic, i) => {
    out.push(
      `insert into public.topics (id, name, position) values (${lit(topic.id)}, ${lit(topic.name)}, ${i + 1}) on conflict (id) do update set name = excluded.name, position = excluded.position;`,
    );
    topic.subtopics.forEach((s, j) => {
      out.push(
        `insert into public.subtopics (id, topic_id, name, position) values (${lit(s.id)}, ${lit(topic.id)}, ${lit(s.name)}, ${j + 1}) on conflict (id) do update set topic_id = excluded.topic_id, name = excluded.name, position = excluded.position;`,
      );
    });
  });
  return out.join("\n");
}

export const partId = (exerciseId: string, index: number) => `${exerciseId}-${index + 1}`;

/** Upserts one exercise with its parts and answers. Parts keep stable ids, so attempts stay linked. */
export function exerciseSql(e: Exercise, svg: string | null = null): string {
  const figure = e.figure ? { type: e.figure.type, alt: e.figure.alt, provisional: e.figure.provisional, svg } : null;
  const out: string[] = [];
  out.push(
    `insert into public.exercises (id, pool, open_to_highschool, source_year, source_label, subtopic_id, group_id, difficulty, status, needs_review, review_notes, stem, figure, author_note, concepts, summary, position, updated_at)
values (${[
      lit(e.id), lit(e.pool), lit(e.openToHighschool), lit(e.source.year), lit(e.source.label), lit(e.subtopic), lit(e.group), lit(e.difficulty),
      lit(e.status), lit(e.needsReview), lit(e.reviewNotes || null), lit(e.stem), figure ? json(figure) : "null", lit(e.authorNote),
      textArray(e.concepts), lit(e.summary || null), lit(e.position), "now()",
    ].join(", ")})
on conflict (id) do update set pool = excluded.pool, open_to_highschool = excluded.open_to_highschool, source_year = excluded.source_year,
  source_label = excluded.source_label, subtopic_id = excluded.subtopic_id, group_id = excluded.group_id, difficulty = excluded.difficulty,
  status = excluded.status, needs_review = excluded.needs_review, review_notes = excluded.review_notes, stem = excluded.stem, figure = excluded.figure,
  author_note = excluded.author_note, concepts = excluded.concepts, summary = excluded.summary, position = excluded.position, updated_at = now();`,
  );
  e.parts.forEach((p, i) => {
    const id = partId(e.id, i);
    const a = p.answer;
    out.push(
      `insert into public.exercise_parts (id, exercise_id, position, label, question, answer_type, unit, choices, skills, animation)
values (${[lit(id), lit(e.id), lit(i + 1), lit(p.label), lit(p.question), lit(a.type), lit(a.type === "number" ? a.unit : null),
        a.type === "choice" ? json(a.choices) : "null", textArray(p.skills), p.animation ? json(p.animation) : "null"].join(", ")})
on conflict (id) do update set position = excluded.position, label = excluded.label, question = excluded.question, answer_type = excluded.answer_type,
  unit = excluded.unit, choices = excluded.choices, skills = excluded.skills, animation = excluded.animation;`,
    );
    out.push(
      `insert into public.part_answers (part_id, correct_value, correct_choice, tolerance_pct, final_answer, solution)
values (${[lit(id), lit(a.type === "number" ? a.value : null), lit(a.type === "choice" ? a.correct : null),
        lit(a.type === "number" ? (a.tolerancePct ?? null) : null), lit(p.finalAnswer), json(p.solution)].join(", ")})
on conflict (part_id) do update set correct_value = excluded.correct_value, correct_choice = excluded.correct_choice,
  tolerance_pct = excluded.tolerance_pct, final_answer = excluded.final_answer, solution = excluded.solution;`,
    );
  });
  // Parts removed from the file (rare): remove them too.
  out.push(`delete from public.exercise_parts where exercise_id = ${lit(e.id)} and position > ${e.parts.length};`);
  return out.join("\n");
}
