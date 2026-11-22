// Reads the session on every request.
export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CatalogTree } from "@/components/CatalogTree";
import { Card, Page } from "@/components/ui";
import { getAccess } from "@/lib/access";
import { publicCatalog, toTree, type CatalogItem } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "תרגול | 100 בפיזיקה" };

type Row = { topic_id: string; topic_name: string; subtopic_id: string; subtopic_name: string; exercise_count: number };
type Ex = { id: string; source_label: string | null; difficulty: number; unlocked: boolean };

export default async function PracticePage() {
  const access = await getAccess();
  if (access.state === "unconfigured") redirect("/setup-needed");
  if (access.state === "needs-device") redirect("/device?next=/practice");
  if (access.state === "locked") redirect("/locked");

  // A visitor who is not logged in sees the catalog locked: names and difficulty, no content.
  if (access.state === "anon") {
    const supabase = (await createClient())!;
    const topics = await publicCatalog(supabase);
    return (
      <Page title="מאגר השאלות" narrow={false}>
        <Card className="bg-accent-soft">
          <p>
            כדי לפתור שאלות צריך להירשם. מי שנרשם פותח <b className="ltr">2</b> שאלות בחינם, לבחירתו, עם פתרון מלא.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-xl bg-cta px-5 py-2.5 font-bold text-on-cta">להרשמה</Link>
            <Link href="/login?next=/practice" className="rounded-xl border-2 border-accent px-5 py-2.5 font-bold">התחברות</Link>
          </div>
        </Card>
        <CatalogTree topics={topics} />
      </Page>
    );
  }

  const { supabase, profile, hasActiveSubscription } = access;
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
  const bySubtopic = new Map(
    rows.map((r, i) => [
      r.subtopic_id,
      ((lists[i].data ?? []) as Ex[])
        .slice()
        .sort((a, b) => year(a) - year(b))
        .map((e, j): CatalogItem => ({
          key: e.id,
          label: e.source_label ?? `שאלה ${j + 1}`,
          difficulty: e.difficulty,
          href: `/exercise/${e.id}`,
          mark: solved.has(e.id) ? "solved" : e.unlocked ? undefined : "locked",
        })),
    ]),
  );

  return (
    <Page title="תרגול" narrow={false}>
      {!hasActiveSubscription && (
        <Card className="bg-accent-soft">
          <p>
            אפשר לפתוח <b className="ltr">{trialLeft ?? 0}</b> תרגילים נוספים בחינם, לבחירתך. <Link href="/subscribe" className="font-semibold text-accent underline">למנוי</Link>
          </p>
        </Card>
      )}
      <CatalogTree topics={toTree(rows, (id) => bySubtopic.get(id) ?? [])} />
    </Page>
  );
}
