"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { ANIMATIONS } from "@/components/animations/registry";
import { InlineText, SolutionSteps, type SolutionStep } from "@/components/SolutionSteps";

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

export type PlayerPart = {
  id: string;
  label: string;
  question: string;
  answerType: "number" | "choice" | "open";
  unit: string | null;
  choices: string[] | null;
  solved: boolean;
};

type Feedback = { result: string; message: string } | null;
type Solution = { solution: SolutionStep[]; final_answer: string } | null;

const unitLabel = (u: string | null) => (u ?? "").replace("^2", "²").replace("^3", "³").replace("^-1", "⁻¹");

export function ExercisePlayer({ exercise, parts, adminPanel }: { exercise: PlayerExercise; parts: PlayerPart[]; adminPanel?: ReactNode }) {
  const [current, setCurrent] = useState(() => Math.max(0, parts.findIndex((p) => !p.solved)));
  const [solved, setSolved] = useState<Record<string, boolean>>(() => Object.fromEntries(parts.map((p) => [p.id, p.solved])));
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [choice, setChoice] = useState<Record<string, number | null>>({});
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [solutions, setSolutions] = useState<Record<string, Solution>>({});
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const part = parts[current];
  const Animation = ANIMATIONS[exercise.id];
  const fb = feedback[part.id];
  const sol = solutions[part.id];
  const isLast = current === parts.length - 1;

  const select = (i: number) => {
    setCurrent(i);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  async function check() {
    setBusy(true);
    try {
      const body = part.answerType === "choice" ? { partId: part.id, choice: choice[part.id] } : { partId: part.id, input: inputs[part.id] ?? "" };
      const res = await fetch("/api/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.status === 401) return router.push(`/login?next=/exercise/${exercise.id}`);
      const data = res.ok ? await res.json() : { result: "error", message: "לא הצלחנו לבדוק את התשובה. נסה שוב." };
      setFeedback((f) => ({ ...f, [part.id]: data }));
      if (data.result === "correct") setSolved((s) => ({ ...s, [part.id]: true }));
    } finally {
      setBusy(false);
    }
  }

  async function openSolution() {
    if (sol) return;
    setBusy(true);
    try {
      const res = await fetch("/api/solution", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partId: part.id }) });
      if (res.ok) {
        const data = await res.json();
        setSolutions((s) => ({ ...s, [part.id]: data }));
      }
    } finally {
      setBusy(false);
    }
  }

  const fbStyle =
    fb?.result === "correct" ? "bg-key-soft text-key" : fb?.result === "too_few_digits" || fb?.result === "invalid" ? "bg-caution-soft text-caution" : "bg-warn-soft text-warn";

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
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-4" aria-label="נוסח השאלה">
          <h1 className="flex items-baseline justify-between gap-2 text-base font-bold">
            <span className="text-accent underline underline-offset-4">{exercise.sourceLabel ?? "שאלה"}</span>
            <span className="text-sm font-medium text-muted">
              קושי <span className="ltr">{exercise.difficulty}/5</span>
            </span>
          </h1>
          {exercise.figure && (
            <figure className="m-0 mx-auto w-full max-w-xl" aria-label={exercise.figure.alt}>
              {/* Our own reviewed SVG drawings (checked at import: no scripts or external links). */}
              <div role="img" aria-label={exercise.figure.alt} className="fig ltr" dangerouslySetInnerHTML={{ __html: exercise.figure.svg }} />
            </figure>
          )}
          <p className="text-justify leading-relaxed">
            <InlineText text={exercise.stem} />
          </p>
          <ol className="flex flex-col gap-1">
            {parts.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  className={`grid w-full grid-cols-[2.4em_minmax(0,1fr)] rounded-md px-2 py-1 text-start ${i === current ? "bg-accent-soft outline outline-1 outline-accent" : "hover:bg-background"}`}
                >
                  <b>{p.label}.</b>
                  <span>
                    <InlineText text={p.question} /> {solved[p.id] && <span className="text-key" aria-label="נפתר">✓</span>}
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
        <section className="flex min-w-0 flex-col gap-3" aria-label={`סעיף ${part.label}`}>
          <div className="flex gap-2" role="tablist" aria-label="סעיפים">
            {parts.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                type="button"
                aria-selected={i === current}
                onClick={() => select(i)}
                className={`min-h-11 flex-1 rounded-xl border text-sm font-bold ${i === current ? "border-cta bg-cta text-on-cta" : "border-line bg-surface text-muted"}`}
              >
                סעיף {p.label} {solved[p.id] && "✓"}
              </button>
            ))}
          </div>

          {Animation && <Animation key={current} part={current} />}

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold">
              <b>{part.label}.</b> <InlineText text={part.question} />
            </p>

            {part.answerType === "number" && (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!busy) check();
                }}
              >
                <label className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border-2 border-line bg-background px-3 focus-within:border-accent" dir="ltr">
                  <input
                    ref={inputRef}
                    id={`answer-${part.id}`}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="התשובה שלך"
                    aria-label="התשובה שלך"
                    value={inputs[part.id] ?? ""}
                    onChange={(e) => setInputs((s) => ({ ...s, [part.id]: e.target.value }))}
                    className="min-w-0 flex-1 bg-transparent font-mono text-lg outline-none"
                  />
                  {part.unit && <span className="font-mono text-muted">{unitLabel(part.unit)}</span>}
                </label>
                <button disabled={busy || !(inputs[part.id] ?? "").trim()} className="min-h-12 rounded-xl bg-cta px-5 font-bold text-on-cta disabled:opacity-50">
                  בדיקה
                </button>
              </form>
            )}

            {part.answerType === "choice" && part.choices && (
              <div className="flex flex-col gap-2" role="radiogroup">
                {part.choices.map((c, i) => (
                  <label key={i} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
                    <input type="radio" name={part.id} checked={choice[part.id] === i} onChange={() => setChoice((s) => ({ ...s, [part.id]: i }))} />
                    <InlineText text={c} />
                  </label>
                ))}
                <button onClick={check} disabled={busy || choice[part.id] == null} className="min-h-12 rounded-xl bg-cta px-5 font-bold text-on-cta disabled:opacity-50">
                  בדיקה
                </button>
              </div>
            )}

            {part.answerType === "open" && <p className="text-sm text-muted">בסעיף הזה (שרטוט או הסבר) אין בדיקה אוטומטית. כשתסיים, השווה לפתרון המלא.</p>}

            {fb && (
              <p role="status" className={`rounded-lg px-3 py-2 font-semibold ${fbStyle}`}>
                {fb.message}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {fb && fb.result !== "correct" && part.answerType !== "open" && (
                <button type="button" onClick={() => inputRef.current?.focus()} className="min-h-11 rounded-xl border border-line px-4 font-semibold">
                  לנסות שוב
                </button>
              )}
              {!sol && (
                <button type="button" onClick={openSolution} disabled={busy} className="min-h-11 rounded-xl border border-line px-4 font-semibold">
                  לפתרון המלא של סעיף {part.label}
                </button>
              )}
            </div>

            {(solved[part.id] || sol || part.answerType === "open") &&
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
                  לסעיף {parts[current + 1].label}
                </button>
              ))}
          </div>

          {sol && (
            <section className="flex flex-col gap-3" aria-label={`פתרון סעיף ${part.label}`}>
              <h2 className="text-lg font-bold text-accent">פתרון מלא · סעיף {part.label}</h2>
              <SolutionSteps steps={sol.solution} />
              <p className="flex justify-between gap-2 border-t border-line pt-3 font-bold">
                <span>תשובה סופית</span>
                <InlineText text={sol.final_answer} />
              </p>
            </section>
          )}
        </section>
      </div>

      <nav className="mt-2 flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-3 py-2 text-sm" aria-label="מעבר בין שאלות">
        {exercise.nav.prev ? (
          <Link href={`/exercise/${exercise.nav.prev}`} className="min-h-10 rounded-lg border border-line px-3 py-2 font-semibold">› הקודמת</Link>
        ) : (
          <span />
        )}
        <span className="text-muted">
          שאלה <span className="ltr">{exercise.nav.index}</span> מתוך <span className="ltr">{exercise.nav.total}</span>
        </span>
        {exercise.nav.next ? (
          <Link href={`/exercise/${exercise.nav.next}`} className="min-h-10 rounded-lg border border-line px-3 py-2 font-semibold">הבאה ‹</Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
