// Reads the session on every request.
export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import { Card, Page } from "@/components/ui";
import { requireUser } from "@/lib/access";

export const metadata: Metadata = { title: "תרגול | 100 בפיזיקה" };

type Row = { topic_id: string; topic_name: string; subtopic_id: string; subtopic_name: string; exercise_count: number };

export default async function PracticePage() {
  const { supabase, hasActiveSubscription } = await requireUser("/practice");
  const [{ data }, { data: trialLeft }] = await Promise.all([supabase.rpc("catalog"), supabase.rpc("trial_remaining")]);
  const rows = (data ?? []) as Row[];
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
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map(([id, name]) => (
          <Card key={id}>
            <h2 className="text-lg font-bold text-accent">{name}</h2>
            <ul className="flex flex-col divide-y divide-line">
              {rows.filter((r) => r.topic_id === id).map((r) => (
                <li key={r.subtopic_id}>
                  <Link href={`/practice/${r.subtopic_id}`} className="flex justify-between gap-2 py-2 hover:text-accent">
                    <span>{r.subtopic_name}</span>
                    <span className="ltr text-muted">{r.exercise_count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Page>
  );
}
