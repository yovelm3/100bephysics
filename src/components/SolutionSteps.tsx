import { Math } from "@/components/Math";

/** One row of a full solution: what we do, why, and the calculation (LaTeX). */
export type SolutionStep =
  | { kind: "step"; what: string; why: string; tex: string }
  | { kind: "explain"; text: string };

/**
 * Full solution in the approved format: three columns ("מה עושים", "למה", "חישוב") on wide screens,
 * one card per row on phones. All rows use the same text colour.
 * `what` may contain inline formulas written as $...$.
 */
export function SolutionSteps({ steps }: { steps: SolutionStep[] }) {
  return (
    <div className="flex flex-col gap-3">
      {groupSteps(steps).map((group, i) =>
        group.kind === "explain" ? (
          <p key={i} className="text-muted">
            <InlineText text={group.text} />
          </p>
        ) : (
          <div key={i} className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="hidden grid-cols-[11rem_minmax(0,1fr)_14rem] border-b border-line text-sm font-bold text-muted md:grid">
              <div className="px-4 py-2.5">מה עושים</div>
              <div className="px-4 py-2.5">למה</div>
              <div className="px-4 py-2.5">חישוב</div>
            </div>
            {group.rows.map((row, j) => (
              <div
                key={j}
                className="grid grid-cols-1 gap-1 border-t border-line px-4 py-3 first:border-t-0 md:grid-cols-[11rem_minmax(0,1fr)_14rem] md:gap-0 md:px-0 md:py-0"
              >
                <div className="font-bold md:px-4 md:py-3 md:font-semibold">
                  <InlineText text={row.what} />
                </div>
                <div className="text-muted md:px-4 md:py-3">
                  <InlineText text={row.why} />
                </div>
                <div className="overflow-x-auto text-left md:px-4 md:py-3">
                  <Math tex={row.tex} />
                </div>
              </div>
            ))}
          </div>
        ),
      )}
    </div>
  );
}

/** Hebrew text with inline $formulas$ rendered left-to-right. */
export function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("$") && p.endsWith("$") && p.length > 2 ? <Math key={i} tex={p.slice(1, -1)} /> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

type Group =
  | { kind: "explain"; text: string }
  | { kind: "rows"; rows: Extract<SolutionStep, { kind: "step" }>[] };

function groupSteps(steps: SolutionStep[]): Group[] {
  const groups: Group[] = [];
  for (const s of steps) {
    if (s.kind === "explain") {
      groups.push({ kind: "explain", text: s.text });
    } else {
      const last = groups[groups.length - 1];
      if (last && last.kind === "rows") last.rows.push(s);
      else groups.push({ kind: "rows", rows: [s] });
    }
  }
  return groups;
}
