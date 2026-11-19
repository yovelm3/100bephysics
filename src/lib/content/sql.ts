import type { Exercise, Topics } from "./schema";
import { exerciseRows, topicRows } from "./rows";

export { partId } from "./rows";

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

const JSONB = new Set(["figure", "choices", "animation", "solution"]);
const TEXT_ARRAY = new Set(["concepts", "skills"]);

/** insert ... on conflict (key) do update set <every other column> = excluded.<column> */
function upsert(table: string, key: string, row: Record<string, unknown>, extra: Record<string, string> = {}): string {
  const cols = [...Object.keys(row), ...Object.keys(extra)];
  const vals = [
    ...Object.entries(row).map(([k, v]) => (v === null ? "null" : JSONB.has(k) ? json(v) : TEXT_ARRAY.has(k) ? textArray(v as string[]) : lit(v))),
    ...Object.values(extra),
  ];
  const set = cols.filter((c) => c !== key).map((c) => `${c} = excluded.${c}`).join(", ");
  return `insert into public.${table} (${cols.join(", ")}) values (${vals.join(", ")}) on conflict (${key}) do update set ${set};`;
}

/** Upserts the topic tree (never deletes topics that may already have exercises). */
export function topicsSql(t: Topics): string {
  const { topics, subtopics } = topicRows(t);
  return [...topics.map((r) => upsert("topics", "id", r)), ...subtopics.map((r) => upsert("subtopics", "id", r))].join("\n");
}

/** Upserts one exercise with its parts and answers. Parts keep stable ids, so attempts stay linked. */
export function exerciseSql(e: Exercise, svg: string | null = null): string {
  const { exercise, parts, answers } = exerciseRows(e, svg);
  return [
    upsert("exercises", "id", exercise, { updated_at: "now()" }),
    ...parts.flatMap((p, i) => [upsert("exercise_parts", "id", p), upsert("part_answers", "part_id", answers[i])]),
    // Parts removed from the file (rare): remove them too.
    `delete from public.exercise_parts where exercise_id = ${lit(e.id)} and position > ${parts.length};`,
  ].join("\n");
}
