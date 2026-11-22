import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServerSupabase } from "@/lib/supabase/server";

export type CatalogItem = { key: string; label: string; difficulty: number; href?: string; mark?: "solved" | "locked" };
export type CatalogSubtopic = { id: string; name: string; items: CatalogItem[] };
export type CatalogTopic = { id: string; name: string; subtopics: CatalogSubtopic[] };

type TreeRow = { topic_id: string; topic_name: string; subtopic_id: string; subtopic_name: string };

const year = (label: string | null) => Number(label?.match(/\d{4}/)?.[0] ?? 9999);

/** Groups the rows of the catalog() function into topics, in their order. */
export function toTree(rows: TreeRow[], items: (subtopicId: string) => CatalogItem[]): CatalogTopic[] {
  const topics = new Map<string, CatalogTopic>();
  for (const r of rows) {
    if (!topics.has(r.topic_id)) topics.set(r.topic_id, { id: r.topic_id, name: r.topic_name, subtopics: [] });
    topics.get(r.topic_id)!.subtopics.push({ id: r.subtopic_id, name: r.subtopic_name, items: items(r.subtopic_id) });
  }
  return [...topics.values()];
}

/**
 * The locked catalog for a visitor who is not logged in: what the high school track sees,
 * as names and difficulty only. No exercise content and no answers leave the server.
 * The exercise list is read with the secret key, because list_exercises() is for logged-in users.
 */
export async function publicCatalog(supabase: ServerSupabase): Promise<CatalogTopic[]> {
  const { data: rows } = await supabase.rpc("catalog", { p_track: "highschool" });
  const admin = createAdminClient();
  const byId = new Map<string, CatalogItem[]>();
  if (admin) {
    const { data } = await admin
      .from("exercises")
      .select("id, subtopic_id, pool, open_to_highschool, source_label, difficulty, position")
      .eq("status", "published");
    const visible = (data ?? []).filter((e) => e.pool === "bagrut" || e.open_to_highschool);
    visible.sort((a, b) => year(a.source_label) - year(b.source_label) || a.position - b.position);
    for (const e of visible) {
      const list = byId.get(e.subtopic_id) ?? [];
      list.push({
        key: e.id,
        label: e.pool === "bagrut" && e.source_label ? e.source_label : `שאלה ${list.length + 1}`,
        difficulty: e.pool === "mechina" ? Math.max(e.difficulty, 4) : e.difficulty,
        mark: "locked",
      });
      byId.set(e.subtopic_id, list);
    }
  }
  return toTree((rows ?? []) as TreeRow[], (id) => byId.get(id) ?? []);
}
