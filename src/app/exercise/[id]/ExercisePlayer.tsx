"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { ANIMATIONS } from "@/components/animations/registry";
import { InlineText, SolutionSteps, type SolutionStep } from "@/components/SolutionSteps";
import { ZoomFigure } from "@/components/ZoomFigure";
import { speakable } from "@/lib/speak";

export type PlayerExercise = {
  id: string;
  sourceLabel: string | null;
  difficulty: number;
  stem: string;
  figure: { svg: string; alt: string; provisional: boolean } | null;
  authorNote: string | null;
  isDraft: boolean;
  topicName: string;
  subtopicName: string;
  subtopicId: string;
  nav: { index: number; total: number; prev: string | null; next: string | null };
};

/** One database row: a whole part, or one answer box ("slot") of a part that asks for several numbers. */
export type PlayerPart = {
  id: string;
  label: string;
  slot: string | null;
  question: string;
  answerType: "number" | "choice" | "open";
  unit: string | null;
  choices: string[] | null;
  solved: boolean;
};

/** What the student sees as one part ("סעיף ב"): one row, or several slots with the same label. */
type Section = { label: string; question: string; rows: PlayerPart[] };

type Feedback = { result: string; message: string } | null;
type Solution = { solution: SolutionStep[]; final_answer: string } | null;

const unitLabel = (u: string | null) => (u ?? "").replace("^2", "²").replace("^3", "³").replace("^-1", "⁻¹");

function toSections(parts: PlayerPart[]): Section[] {
  const out: Section[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (last && last.label === p.label) last.rows.push(p);
    else out.push({ label: p.label, question: p.question, rows: [p] });
  }
  return out;
}

/** Arrow icons drawn as SVG, so right-to-left text never mirrors them. */
function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <path d="M13 8H3M7 4 3 8l4 4" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
    </svg>
  );
}

export function ExercisePlayer({ exercise, parts, adminPanel }: { exercise: PlayerExercise; parts: PlayerPart[]; adminPanel?: ReactNode }) {
  const sections = toSections(parts);
  const [current, setCurrent] = useState(() => Math.max(0, sections.findIndex((s) => s.rows.some((r) => !r.solved))));
  const [solved, setSolved] = useState<Record<string, boolean>>(() => Object.fromEntries(parts.map((p) => [p.id, p.solved])));
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [choice, setChoice] = useState<Record<string, number | null>>({});
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [solutions, setSolutions] = useState<Record<string, Solution>>({});
  const [busy, setBusy] = useState(false);
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const section = sections[current];
  const first = section.rows[0];
  const kind = first.answerType;
  const Animation = ANIMATIONS[exercise.id];
  const sol = solutions[first.id];
  const isLast = current === sections.length - 1;
  const sectionSolved = (s: Section) => s.rows.every((r) => solved[r.id]);
  const done = sectionSolved(section);

  const select = (i: number) => {
    setCurrent(i);
    setSolutionError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  async function checkRow(row: PlayerPart) {
    const body = row.answerType === "choice" ? { partId: row.id, choice: choice[row.id] } : { partId: row.id, input: inputs[row.id] ?? "" };
    const res = await fetch("/api/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 401) {
      router.push(`/login?next=/exercise/${exercise.id}`);
      return;
    }
    const data = res.ok ? await res.json() : { result: "error", message: "לא הצלחנו לבדוק את התשובה. ייתכן שהשאלה עודכנה בינתיים: רענן את הדף ונסה שוב." };
    setFeedback((f) => ({ ...f, [row.id]: data }));
    if (data.result === "correct") setSolved((s) => ({ ...s, [row.id]: true }));
  }

  /** Checks every answer box of the active part that has something typed in it. */
  async function check() {
    setBusy(true);
    try {
      const rows = section.rows.filter((r) => (r.answerType === "choice" ? choice[r.id] != null : (inputs[r.id] ?? "").trim() && !solved[r.id]));
      for (const r of rows) await checkRow(r);
    } finally {
      setBusy(false);
    }
  }

  async function openSolution() {
    if (sol) return;
    setBusy(true);
    try {
      const res = await fetch("/api/solution", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partId: first.id }) });
      if (res.ok) {
        const data = await res.json();
        setSolutions((s) => ({ ...s, [first.id]: data }));
      } else {
        setSolutionError("לא הצלחנו לפתוח את הפתרון. ייתכן שהשאלה עודכנה בינתיים: רענן את הדף ונסה שוב.");
      }
    } finally {
      setBusy(false);
    }
  }

  const fbStyle = (f: Feedback) =>
    f?.result === "correct" ? "bg-key-soft text-key" : f?.result === "too_few_digits" || f?.result === "invalid" ? "bg-caution-soft text-caution" : "bg-warn-soft text-warn";
  const anyTyped = section.rows.some((r) => (inputs[r.id] ?? "").trim() && !solved[r.id]);
  const anyWrong = section.rows.some((r) => feedback[r.id] && feedback[r.id]!.result !== "correct");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>
          {exercise.topicName} › <Link href={`/practice/${exercise.subtopicId}`} className="underline-offset-4 hover:underline">{exercise.subtopicName}</Link>
        </span>
        {exercise.isDraft && <span className="rounded-full bg-caution-soft px-3 py-0.5 font-bold text-caution">טיוטה: רק מנהל רואה</span>}
      </div>

      {adminPanel}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* Stem: one compact block, like the source booklets */}
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4" aria-label="נוסח השאלה">
          <h1 className="flex items-baseline justify-between gap-2 text-base font-bold">
            <span className="text-accent underline underline-offset-4">{exercise.sourceLabel ?? "שאלה"}</span>
            <span className="text-sm font-medium text-muted">
              קושי <span className="ltr">{exercise.difficulty}/5</span>
            </span>
          </h1>
          {exercise.figure && (
            <figure className="m-0 w-full" aria-label={exercise.figure.alt}>
              {/* Our own reviewed SVG drawings (checked at import: no scripts or external links). */}
              <ZoomFigure svg={exercise.figure.svg} alt={exercise.figure.alt} />
            </figure>
          )}
          <p className="text-justify leading-relaxed">
            <InlineText text={exercise.stem} />
          </p>
          <ol className="flex flex-col gap-1">
            {sections.map((s, i) => (
              <li key={s.label}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  className={`grid w-full grid-cols-[2.4em_minmax(0,1fr)] rounded-md px-2 py-1 text-start ${i === current ? "bg-accent-soft outline outline-1 outline-accent" : "hover:bg-background"}`}
                >
                  <b>{s.label}.</b>
                  <span>
                    <InlineText text={s.question} /> {sectionSolved(s) && <span className="text-key" aria-label="נפתר">✓</span>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {exercise.authorNote && (
            <div className="rounded-lg border-s-4 border-accent bg-accent-soft px-3 py-2 text-[0.95em]">
              <b className="text-accent">דגש מהמחבר: </b>
              <InlineText text={exercise.authorNote} />
            </div>
          )}
        </section>

        {/* The active part */}
        <section className="flex min-w-0 flex-col gap-3" aria-label={`סעיף ${section.label}`}>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="סעיפים">
            {sections.map((s, i) => (
              <button
                key={s.label}
                role="tab"
                type="button"
                aria-selected={i === current}
                onClick={() => select(i)}
                className={`min-h-11 min-w-16 flex-1 rounded-xl border text-sm font-bold ${i === current ? "border-cta bg-cta text-on-cta" : "border-line bg-surface text-muted"}`}
              >
                סעיף {s.label} {sectionSolved(s) && "✓"}
              </button>
            ))}
          </div>

          {Animation && <Animation key={current} part={current} />}

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold">
              <b>{section.label}.</b> <InlineText text={section.question} />
            </p>

            {kind === "number" && (
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!busy) check();
                }}
              >
                {section.rows.map((r, k) => (
                  <div key={r.id} className="flex flex-col gap-1">
                    {r.slot && (
                      <span className="text-sm font-semibold text-muted">
                        <InlineText text={r.slot} />
                      </span>
                    )}
                    <label className="flex min-h-12 min-w-0 items-center gap-2 rounded-xl border-2 border-line bg-background px-3 focus-within:border-accent" dir="ltr">
                      <input
                        ref={k === 0 ? inputRef : undefined}
                        id={`answer-${r.id}`}
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="התשובה שלך"
                        aria-label={r.slot ? `התשובה שלך: ${speakable(r.slot)}` : "התשובה שלך"}
                        value={inputs[r.id] ?? ""}
                        disabled={solved[r.id]}
                        onChange={(e) => setInputs((s) => ({ ...s, [r.id]: e.target.value }))}
                        className="min-w-0 flex-1 bg-transparent font-mono text-lg outline-none"
                      />
                      {r.unit && <span className="font-mono text-muted">{unitLabel(r.unit)}</span>}
                      {solved[r.id] && <span className="text-key" aria-label="נכון">✓</span>}
                    </label>
                    {feedback[r.id] && section.rows.length > 1 && (
                      <p role="status" className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${fbStyle(feedback[r.id])}`}>
                        {feedback[r.id]!.message}
                      </p>
                    )}
                  </div>
                ))}
                <button disabled={busy || !anyTyped} className="min-h-12 rounded-xl bg-cta px-5 font-bold text-on-cta disabled:opacity-50">
                  בדיקה
                </button>
              </form>
            )}

            {kind === "choice" && first.choices && (
              <div className="flex flex-col gap-2" role="radiogroup">
                {first.choices.map((c, i) => (
                  <label key={i} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
                    <input type="radio" name={first.id} checked={choice[first.id] === i} onChange={() => setChoice((s) => ({ ...s, [first.id]: i }))} />
                    <InlineText text={c} />
                  </label>
                ))}
                <button onClick={check} disabled={busy || choice[first.id] == null} className="min-h-12 rounded-xl bg-cta px-5 font-bold text-on-cta disabled:opacity-50">
                  בדיקה
                </button>
              </div>
            )}

            {kind === "open" && <p className="text-sm text-muted">בסעיף הזה (שרטוט או הסבר) אין בדיקה אוטומטית. כשתסיים, השווה לפתרון המלא.</p>}

            {section.rows.length === 1 && feedback[first.id] && (
              <p role="status" className={`rounded-lg px-3 py-2 font-semibold ${fbStyle(feedback[first.id])}`}>
                {feedback[first.id]!.message}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {anyWrong && kind !== "open" && (
                <button type="button" onClick={() => inputRef.current?.focus()} className="min-h-11 rounded-xl border border-line px-4 font-semibold">
                  לנסות שוב
                </button>
              )}
              {!sol && (
                <button type="button" onClick={openSolution} disabled={busy} className="min-h-11 rounded-xl border border-line px-4 font-semibold">
                  לפתרון המלא של סעיף {section.label}
                </button>
              )}
            </div>
            {solutionError && !sol && (
              <p role="alert" className="rounded-lg bg-warn-soft px-3 py-2 text-sm font-semibold text-warn">
                {solutionError}
              </p>
            )}

            {(done || sol || kind === "open") &&
              (isLast ? (
                exercise.nav.next ? (
                  <Link href={`/exercise/${exercise.nav.next}`} className="min-h-12 rounded-xl bg-cta px-5 py-3 text-center text-lg font-bold text-on-cta">
                    לשאלה הבאה
                  </Link>
                ) : (
                  <Link href={`/practice/${exercise.subtopicId}`} className="min-h-12 rounded-xl bg-cta px-5 py-3 text-center text-lg font-bold text-on-cta">
                    לרשימת השאלות
                  </Link>
                )
              ) : (
                <button type="button" onClick={() => select(current + 1)} className="min-h-12 rounded-xl bg-cta px-5 text-lg font-bold text-on-cta">
                  לסעיף {sections[current + 1].label}
                </button>
              ))}
          </div>
        </section>
      </div>

      {/* Full solution of the active part: below the question, full width (owner's decision). Opens only on request. */}
      {sol && (
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 md:p-5" aria-label={`פתרון סעיף ${section.label}`}>
          <h2 className="text-lg font-bold text-accent">פתרון מלא · סעיף {section.label}</h2>
          <SolutionSteps steps={sol.solution} />
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line pt-3 font-bold">
            <span className="text-accent">תשובה סופית</span>
            <span>
              <InlineText text={sol.final_answer} />
            </span>
          </p>
        </section>
      )}

      <nav className="mt-2 flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-3 py-2 text-sm" aria-label="מעבר בין שאלות">
        {exercise.nav.prev ? (
          <Link href={`/exercise/${exercise.nav.prev}`} className="flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 py-2 font-semibold">
            <Arrow dir="right" />
            הקודמת
          </Link>
        ) : (
          <span />
        )}
        <span className="text-muted">
          שאלה <span className="ltr">{exercise.nav.index}</span> מתוך <span className="ltr">{exercise.nav.total}</span>
        </span>
        {exercise.nav.next ? (
          <Link href={`/exercise/${exercise.nav.next}`} className="flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 py-2 font-semibold">
            הבאה
            <Arrow dir="left" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
