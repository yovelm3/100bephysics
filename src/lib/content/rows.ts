import type { Exercise, Topics } from "./schema";

/** Database rows for one exercise. sql.ts (SQL import) and import.ts (admin button) both build from these. */
export const partId = (exerciseId: string, index: number) => `${exerciseId}-${index + 1}`;

export function topicRows(t: Topics) {
  const topics = t.topics.map((topic, i) => ({ id: topic.id, name: topic.name, position: i + 1 }));
  const subtopics = t.topics.flatMap((topic) => topic.subtopics.map((s, j) => ({ id: s.id, topic_id: topic.id, name: s.name, position: j + 1 })));
  return { topics, subtopics };
}

export function exerciseRows(e: Exercise, svg: string | null = null) {
  const exercise = {
    id: e.id,
    pool: e.pool,
    open_to_highschool: e.openToHighschool,
    source_year: e.source.year,
    source_label: e.source.label,
    subtopic_id: e.subtopic,
    group_id: e.group,
    difficulty: e.difficulty,
    status: e.status,
    needs_review: e.needsReview,
    review_notes: e.reviewNotes || null,
    stem: e.stem,
    figure: e.figure ? { type: e.figure.type, alt: e.figure.alt, provisional: e.figure.provisional, svg } : null,
    author_note: e.authorNote,
    concepts: e.concepts,
    summary: e.summary || null,
    position: e.position,
  };
  // One database row per answer box: a "multi" part becomes several rows with the same label (one per number).
  type Slot = { p: (typeof e.parts)[number]; slot: string | null; value: number | null; unit: string | null; tol: number | null };
  const slots: Slot[] = e.parts.flatMap((p): Slot[] =>
    p.answer.type === "multi"
      ? p.answer.items.map((it) => ({ p, slot: it.label, value: it.value, unit: it.unit, tol: it.tolerancePct ?? null }))
      : [{ p, slot: null, value: p.answer.type === "number" ? p.answer.value : null, unit: p.answer.type === "number" ? p.answer.unit : null, tol: p.answer.type === "number" ? (p.answer.tolerancePct ?? null) : null }],
  );
  const parts = slots.map(({ p, slot, unit }, i) => ({
    id: partId(e.id, i),
    exercise_id: e.id,
    position: i + 1,
    label: p.label,
    slot,
    question: p.question,
    answer_type: p.answer.type === "multi" ? "number" : p.answer.type,
    unit,
    choices: p.answer.type === "choice" ? p.answer.choices : null,
    skills: p.skills,
    animation: p.animation ?? null,
  }));
  const answers = slots.map(({ p, value, tol }, i) => ({
    part_id: partId(e.id, i),
    correct_value: value,
    correct_choice: p.answer.type === "choice" ? p.answer.correct : null,
    tolerance_pct: tol,
    final_answer: p.finalAnswer,
    solution: p.solution,
  }));
  return { exercise, parts, answers };
}
