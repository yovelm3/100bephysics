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
  const parts = e.parts.map((p, i) => ({
    id: partId(e.id, i),
    exercise_id: e.id,
    position: i + 1,
    label: p.label,
    question: p.question,
    answer_type: p.answer.type,
    unit: p.answer.type === "number" ? p.answer.unit : null,
    choices: p.answer.type === "choice" ? p.answer.choices : null,
    skills: p.skills,
    animation: p.animation ?? null,
  }));
  const answers = e.parts.map((p, i) => ({
    part_id: partId(e.id, i),
    correct_value: p.answer.type === "number" ? p.answer.value : null,
    correct_choice: p.answer.type === "choice" ? p.answer.correct : null,
    tolerance_pct: p.answer.type === "number" ? (p.answer.tolerancePct ?? null) : null,
    final_answer: p.finalAnswer,
    solution: p.solution,
  }));
  return { exercise, parts, answers };
}
