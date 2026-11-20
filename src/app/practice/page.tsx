// Reads the session on every request.
export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import { Card, Page } from "@/components/ui";
import { requireUser } from "@/lib/access";

export const metadata: Metadata = { title: "תרגול | 100 בפיזיקה" };

type Row = { topic_id: string; topic_name: string; subtopic_id: string; subtopic_name: string; exercise_count: number };
type Ex = { id: string; source_label: string | null; difficulty: number; unlocked: boolean };

/** Topics open like a drop-down list: topic → subtopics → questions. Native <details>, so it works without JavaScript. */
export default async function PracticePage() {
  const { supabase, profile, hasActiveSubscription } = await requireUser("/practice");
  const [{ data }, { data: trialLeft }, { data: solvedRows }] = await Promise.all([
    supabase.rpc("catalog"),
    supabase.rpc("trial_remaining"),
    supabase.from("attempts").select("exercise_id").eq("user_id", profile.id).eq("result", "correct"),
  ]);
  const rows = (data ?? []) as Row[];
  const solved = new Set((solvedRows ?? []).map((r) => r.exercise_id as string));
  // Counted from the lists themselves: an admin also sees drafts, which the catalog counts leave out.
  const lists = await Promise.all(rows.map((r) => supabase.rpc("list_exercises", { p_subtopic: r.subtopic_id })));
  const year = (e: Ex) => Number(e.source_label?.match(/\d{4}/)?.[0] ?? 9999);
  const bySubtopic = new Map(rows.map((r, i) => [r.subtopic_id, ((lists[i].data ?? []) as Ex[]).slice().sort((a, b) => year(a) - year(b))]));
  const topics = [...new Map(rows.map((r) => [r.topic_id, r.topic_name])).entries()];

  return (
    <Page title="תרגול" narrow={false}>
      {!hasActiveSubscription && (
        <Card className="bg-accent-soft">
          <p>
            אפשר לפתוח <b className="ltr">{trialLeft ?? 0}</b> תרגילים נוספים בחינם, לבחירתך. <Link href="/subscribe" className="font-semibold text-accent underline">למנוי</Link>
          </p>
        </Card>
      )}
      <div className="flex flex-col gap-3">
        {topics.map(([id, name]) => {
          const subs = rows.filter((r) => r.topic_id === id);
          const total = subs.reduce((n, r) => n + (bySubtopic.get(r.subtopic_id)?.length ?? 0), 0);
          return (
            <details key={id} className="rounded-2xl border border-line bg-surface">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
                <span className="text-lg font-bold text-accent">{name}</span>
                <span className="flex items-center gap-3 text-muted">
                  <span className="text-sm"><span className="ltr">{total}</span> שאלות</span>
                  <span aria-hidden className="transition-transform [details[open]>summary_&]:rotate-180">▾</span>
                </span>
              </summary>
              <ul className="flex flex-col gap-2 px-3 pb-4">
                {subs.map((r) => {
                  const ex = bySubtopic.get(r.subtopic_id) ?? [];
                  return (
                    <li key={r.subtopic_id}>
                      <details className="rounded-xl border border-line">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
                          <span className="font-semibold">{r.subtopic_name}</span>
                          <span className="flex items-center gap-3 text-muted">
                            <span className="ltr text-sm">{ex.length}</span>
                            <span aria-hidden className="transition-transform [details[open]>summary_&]:rotate-180">▾</span>
                          </span>
                        </summary>
                        {ex.length === 0 ? (
                          <p className="px-4 pb-3 text-sm text-muted">עוד אין תרגילים בתת-נושא הזה.</p>
                        ) : (
                          <ul className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
                            {ex.map((e, i) => (
                              <li key={e.id}>
                                <Link href={`/exercise/${e.id}`} className="flex items-center justify-between gap-2 rounded-xl bg-background px-4 py-3 hover:text-accent">
                                  <span>{e.source_label ?? `שאלה ${i + 1}`}</span>
                                  <span className="flex items-center gap-2 text-sm text-muted">
                                    קושי <span className="ltr">{e.difficulty}/5</span>
                                    {solved.has(e.id) ? <span className="text-key">✓</span> : !e.unlocked && <span aria-label="נעול">🔒</span>}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </details>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </Page>
  );
}
