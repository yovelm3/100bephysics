// Reads the session / search params on every request.
export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import { Card, Page } from "@/components/ui";
import { requireAdmin } from "@/lib/access";
import { isKeyMismatch, reviewNote } from "@/lib/review";

export const metadata: Metadata = { title: "בדיקת תרגילים | 100 בפיזיקה" };

type Row = {
  id: string;
  source_label: string | null;
  source_year: number | null;
  status: "draft" | "published";
  review_notes: string | null;
  subtopics: { name: string; position: number; topics: { name: string; position: number } } | null;
};

const FILTERS = [
  { key: "mismatch", label: "אי-התאמה למפתח" },
  { key: "draft", label: "כל הטיוטות" },
  { key: "published", label: "פורסמו" },
] as const;

/** Owner review queue: every exercise, the disagreements with the answer key first. */
export default async function ReviewPage({ searchParams }: PageProps<"/admin/review">) {
  const { supabase } = await requireAdmin("/admin/review");
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.key === sp.f)?.key ?? "mismatch";

  const { data, error } = await supabase
    .from("exercises")
    .select("id, source_label, source_year, status, review_notes, subtopics(name, position, topics(name, position))")
    .returns<Row[]>();
  if (error) throw new Error(error.message);
  const all = (data ?? []).sort(
    (a, b) =>
      (a.subtopics?.topics.position ?? 0) - (b.subtopics?.topics.position ?? 0) ||
      (a.subtopics?.position ?? 0) - (b.subtopics?.position ?? 0) ||
      (a.source_year ?? 0) - (b.source_year ?? 0),
  );
  const counts = {
    mismatch: all.filter((r) => r.status === "draft" && isKeyMismatch(r.review_notes)).length,
    draft: all.filter((r) => r.status === "draft").length,
    published: all.filter((r) => r.status === "published").length,
  };
  const rows = all.filter((r) => (filter === "published" ? r.status === "published" : r.status === "draft" && (filter === "draft" || isKeyMismatch(r.review_notes))));
  const topics = [...new Set(rows.map((r) => r.subtopics?.topics.name ?? ""))];

  return (
    <Page title="בדיקת תרגילים" narrow={false}>
      <p className="text-sm text-muted">
        <Link href="/admin" className="underline">לוח ניהול</Link> › בדיקת תרגילים
      </p>
      <Card className="gap-2">
        <p>
          פתח שאלה, בדוק נוסח, ציור ופתרון, ולחץ <b>אשר ופרסם</b>. רק אז תלמידים יראו אותה. אם משהו לא נכון, כתוב לי &quot;הערה:&quot; עם שם השאלה.
        </p>
        <p className="text-sm text-muted">
          <span className="ltr">{counts.published}</span> פורסמו מתוך <span className="ltr">{all.length}</span>
        </p>
      </Card>
      <nav className="flex flex-wrap gap-2" aria-label="סינון">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/review?f=${f.key}`}
            aria-current={filter === f.key ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${filter === f.key ? "border-accent bg-accent text-on-accent" : "border-line bg-surface text-accent"}`}
          >
            {f.label} (<span className="ltr">{counts[f.key]}</span>)
          </Link>
        ))}
      </nav>
      {rows.length === 0 && <Card><p className="text-muted">אין כאן שאלות.</p></Card>}
      {topics.map((t) => (
        <section key={t} className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-accent">{t}</h2>
          <ul className="flex flex-col gap-2">
            {rows.filter((r) => (r.subtopics?.topics.name ?? "") === t).map((r) => {
              const note = reviewNote(r.review_notes);
              return (
                <li key={r.id}>
                  <Link href={`/exercise/${r.id}`} className={`flex flex-col gap-1 rounded-2xl border bg-surface p-4 hover:border-accent ${isKeyMismatch(r.review_notes) ? "border-warn" : "border-line"}`}>
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{r.source_label ?? r.id}</span>
                      <span className="text-sm text-muted">{r.subtopics?.name}</span>
                    </span>
                    {note && <span className="text-sm text-muted">{note}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Page>
  );
}
