import Link from "next/link";
import type { CatalogTopic } from "@/lib/catalog";

/** Topics open like a drop-down list: topic → subtopics → questions. Native <details>, so it works without JavaScript. */
export function CatalogTree({ topics }: { topics: CatalogTopic[] }) {
  return (
    <div className="flex flex-col gap-3">
      {topics.map((t) => {
        const total = t.subtopics.reduce((n, s) => n + s.items.length, 0);
        return (
          <details key={t.id} className="rounded-2xl border border-line bg-surface">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
              <span className="text-lg font-bold text-accent">{t.name}</span>
              <span className="flex items-center gap-3 text-muted">
                <span className="text-sm"><span className="ltr">{total}</span> שאלות</span>
                <span aria-hidden className="transition-transform [details[open]>summary_&]:rotate-180">▾</span>
              </span>
            </summary>
            <ul className="flex flex-col gap-2 px-3 pb-4">
              {t.subtopics.map((s) => (
                <li key={s.id}>
                  <details className="rounded-xl border border-line">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
                      <span className="font-semibold">{s.name}</span>
                      <span className="flex items-center gap-3 text-muted">
                        <span className="ltr text-sm">{s.items.length}</span>
                        <span aria-hidden className="transition-transform [details[open]>summary_&]:rotate-180">▾</span>
                      </span>
                    </summary>
                    {s.items.length === 0 ? (
                      <p className="px-4 pb-3 text-sm text-muted">עוד אין תרגילים בתת-נושא הזה.</p>
                    ) : (
                      <ul className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
                        {s.items.map((e) => {
                          const inner = (
                            <>
                              <span>{e.label}</span>
                              <span className="flex items-center gap-2 text-sm text-muted">
                                קושי <span className="ltr">{e.difficulty}/5</span>
                                {e.mark === "solved" && <span className="text-key" aria-label="נפתרה">✓</span>}
                                {e.mark === "locked" && <span aria-label="נעול">🔒</span>}
                              </span>
                            </>
                          );
                          const cls = "flex min-h-11 items-center justify-between gap-2 rounded-xl bg-background px-4 py-3";
                          return (
                            <li key={e.key}>
                              {e.href ? <Link href={e.href} className={`${cls} hover:text-accent`}>{inner}</Link> : <div className={cls}>{inner}</div>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </details>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
