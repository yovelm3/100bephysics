// Reads the session on every request.
export const instant = false;

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Page } from "@/components/ui";
import { requireUser } from "@/lib/access";

type Row = { id: string; source_label: string | null; difficulty: number; unlocked: boolean };

export default async function SubtopicPage({ params }: PageProps<"/practice/[subtopic]">) {
  const { subtopic } = await params;
  if (!/^[a-z0-9-]+$/.test(subtopic)) notFound();
  const { supabase, profile } = await requireUser(`/practice/${subtopic}`);
  const { data: sub } = await supabase.from("subtopics").select("name, topics(name)").eq("id", subtopic).maybeSingle();
  if (!sub) notFound();
  const [{ data }, { data: solvedRows }] = await Promise.all([
    supabase.rpc("list_exercises", { p_subtopic: subtopic }),
    supabase.from("attempts").select("exercise_id").eq("user_id", profile.id).eq("result", "correct"),
  ]);
  const rows = (data ?? []) as Row[];
  const solved = new Set((solvedRows ?? []).map((r) => r.exercise_id as string));

  return (
    <Page title={sub.name} narrow={false}>
      <p className="text-sm text-muted">
        <Link href="/practice" className="underline">תרגול</Link> › {(sub.topics as unknown as { name: string } | null)?.name}
      </p>
      {rows.length === 0 ? (
        <Card><p className="text-muted">עוד אין תרגילים בתת-נושא הזה.</p></Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r, i) => (
            <li key={r.id}>
              <Link href={`/exercise/${r.id}`} className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-4 hover:border-accent">
                <span className="font-semibold">{r.source_label ?? `שאלה ${i + 1}`}</span>
                <span className="flex items-center gap-2 text-sm text-muted">
                  קושי <span className="ltr">{r.difficulty}/5</span>
                  {solved.has(r.id) ? <span className="text-key">✓</span> : !r.unlocked && <span aria-label="נעול">🔒</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
