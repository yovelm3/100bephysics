"use client";

import { useState } from "react";
import { ANIMATIONS } from "@/components/animations/registry";
import { InlineText } from "@/components/SolutionSteps";

/** Part tabs + the animated figure. No answers: the animation never shows them (owner's rule). */
export function DemoAnimation({ id, parts }: { id: string; parts: { label: string; question: string }[] }) {
  const [current, setCurrent] = useState(0);
  const Animation = ANIMATIONS[id];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2" role="tablist">
        {parts.map((p, i) => (
          <button
            key={p.label}
            role="tab"
            aria-selected={i === current}
            onClick={() => setCurrent(i)}
            className={`flex-1 rounded-xl border px-3 py-2.5 font-bold ${i === current ? "border-cta bg-cta text-on-cta" : "border-line bg-surface text-accent"}`}
          >
            סעיף {p.label}
          </button>
        ))}
      </div>
      <p className="font-semibold">
        {parts[current].label}. <InlineText text={parts[current].question} />
      </p>
      {Animation && <Animation key={current} part={current} />}
    </div>
  );
}
