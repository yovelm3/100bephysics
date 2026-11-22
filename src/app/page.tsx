// Reads the session (for the counts the visitor's track sees) on every request.
export const instant = false;

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Row = { topic_id: string; topic_name: string; exercise_count: number };

// Home page. No sample question or solution here (owner's decision): the catalog is one click away, locked.
// New marketing texts are proposed to the owner before they are written here.
export default async function Home() {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.rpc("catalog", { p_track: "highschool" }) : { data: [] };
  const counts = new Map<string, { name: string; n: number }>();
  for (const r of (data ?? []) as Row[]) {
    const c = counts.get(r.topic_id) ?? { name: r.topic_name, n: 0 };
    c.n += r.exercise_count;
    counts.set(r.topic_id, c);
  }
  const topics = [...counts.values()];
  const total = topics.reduce((n, t) => n + t.n, 0);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-10">
      <header className="flex flex-col items-center gap-4 text-center">
        <h1 className="max-w-[18ch] text-4xl leading-tight font-extrabold text-balance md:text-5xl">
          מאגר אחד, כל הנושאים, ותוכנית <span className="text-accent">שמכירה אותך.</span>
        </h1>
        <p className="max-w-[52ch] text-lg text-muted">
          האתר עוקב אחרי החומר שלמדת ואחרי המקומות שבהם נתקעת, ובונה לך מסלול תרגול שמוביל ל-<span className="ltr">100</span>.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="rounded-xl bg-cta px-6 py-3 text-lg font-bold text-on-cta">להרשמה</Link>
          <Link href="/practice" className="rounded-xl border-2 border-accent px-6 py-3 text-lg font-bold">למאגר השאלות</Link>
        </div>
      </header>

      {total > 0 && (
        <section className="flex flex-col gap-4" aria-labelledby="pool">
          <h2 id="pool" className="text-center text-2xl font-bold">
            <span className="ltr">{total}</span> שאלות בגרות במכניקה, עם פתרון מלא לכל סעיף
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {topics.map((t) => (
              <li key={t.name}>
                <Link href="/practice" className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4 hover:border-accent">
                  <span className="font-bold text-accent">{t.name}</span>
                  <span className="text-sm text-muted"><span className="ltr">{t.n}</span> שאלות</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

    </main>
  );
}
