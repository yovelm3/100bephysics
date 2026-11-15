import { Math } from "@/components/Math";

export type StepHighlight = "key" | "warn";

export type SolutionStep =
  | { kind: "step"; what: string; tex: string; highlight?: StepHighlight }
  | { kind: "explain"; text: string };

const rowColor: Record<StepHighlight | "none", string> = {
  none: "text-ink",
  key: "bg-key-soft text-key font-semibold",
  warn: "bg-warn-soft text-warn font-semibold",
};

/**
 * Full solution: each row is one equation with a Hebrew note of what we did.
 * Two columns on wide screens, one card per row on phones.
 * Rows are blue ink; highlighted rows are green (key) or red (warn).
 */
export function SolutionSteps({ steps }: { steps: SolutionStep[] }) {
  return (
    <div className="flex flex-col gap-3">
      {groupSteps(steps).map((group, i) =>
        group.kind === "explain" ? (
          <p key={i} className="text-sm text-muted">
            {group.text}
          </p>
        ) : (
          <div key={i} className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="hidden grid-cols-[10rem_1fr] bg-accent-soft text-xs font-bold text-accent sm:grid">
              <div className="px-3 py-2">מה עשינו</div>
              <div className="px-3 py-2">חישוב</div>
            </div>
            {group.rows.map((row, j) => (
              <div
                key={j}
                className={`grid grid-cols-1 border-t border-line first:border-t-0 sm:grid-cols-[12rem_1fr] sm:first:border-t ${rowColor[row.highlight ?? "none"]}`}
              >
                <div className="px-3 pt-2 text-sm sm:border-e sm:border-line sm:py-2">{row.what}</div>
                <div className="overflow-x-auto px-3 pb-2 text-left sm:py-2">
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
