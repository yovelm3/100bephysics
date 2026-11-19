import "server-only";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadContent } from "./load";
import { exerciseRows, topicRows } from "./rows";

export type ImportResult = { ok: true; exercises: number; parts: number } | { ok: false; errors: string[] };

/**
 * Imports content/topics.json and every exercise file (content/<pool>/<topic>/*.json + its SVG) into the database.
 * Upserts only: never deletes exercises (attempts stay linked). Parts removed from a file are removed.
 * Needs the service-role client (part_answers is server-only).
 */
export async function importContent(admin: SupabaseClient, root = path.join(process.cwd(), "content")): Promise<ImportResult> {
  const { topics, exercises, errors } = loadContent(root);
  if (errors.length) return { ok: false, errors };

  const fail = (what: string, e: { message: string } | null) => (e ? `${what}: ${e.message}` : null);
  const t = topicRows(topics);
  const rows = exercises.map((x) => exerciseRows(x.exercise, x.svg));

  const steps: [string, () => PromiseLike<{ error: { message: string } | null }>][] = [
    ["topics", () => admin.from("topics").upsert(t.topics)],
    ["subtopics", () => admin.from("subtopics").upsert(t.subtopics)],
    ["exercises", () => admin.from("exercises").upsert(rows.map((r) => ({ ...r.exercise, updated_at: new Date().toISOString() })))],
    ["exercise_parts", () => admin.from("exercise_parts").upsert(rows.flatMap((r) => r.parts))],
    ["part_answers", () => admin.from("part_answers").upsert(rows.flatMap((r) => r.answers))],
  ];
  for (const [name, run] of steps) {
    const err = fail(name, (await run()).error);
    if (err) return { ok: false, errors: [err] };
  }
  for (const r of rows) {
    const { error } = await admin.from("exercise_parts").delete().eq("exercise_id", r.exercise.id).gt("position", r.parts.length);
    if (error) return { ok: false, errors: [`delete extra parts of ${r.exercise.id}: ${error.message}`] };
  }
  return { ok: true, exercises: rows.length, parts: rows.reduce((n, r) => n + r.parts.length, 0) };
}
