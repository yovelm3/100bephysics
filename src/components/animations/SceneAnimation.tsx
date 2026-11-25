"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AnimSpec } from "@/lib/animations/engine";
import { svgPainter } from "./svgPainter";

const W = 720, H = 360;

/**
 * Plays one part of an animated figure. Shows what happens and marks what is asked; never draws answers.
 * The formula build is the one drawn; both builds are compared in tests and before every build.
 */
export function SceneAnimation({ spec, part }: { spec: AnimSpec; part: number }) {
  const model = useMemo(() => spec.formula(), [spec]);
  const svgRef = useRef<SVGSVGElement>(null);
  const p = Math.min(Math.max(part, 0), spec.parts.length - 1);
  const P = spec.parts[p];
  const start = P.from ? P.from(model) : 0;
  const end = P.to(model);
  const [t, setT] = useState(start);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  // key moments: the player waits there for a moment, and highlights them
  const holds = useMemo(() => (P.holds ? P.holds(model) : []).filter((h) => h.at > start + 1e-9 && h.at <= end + 1e-9).sort((a, b) => a.at - b.at), [P, model, start, end]);
  const passed = useRef(new Set<number>());
  const holdUntil = useRef(0);
  const [holding, setHolding] = useState<number | null>(null);
  const v0 = spec.views?.[p] ?? spec.view;
  const view = { ...v0, w: v0.w ?? W, h: v0.h ?? H };

  // A new part starts from its own beginning.
  useEffect(() => {
    setPlaying(false);
    setT(start);
    passed.current.clear();
    setHolding(null);
  }, [p, start]);

  useEffect(() => {
    if (!svgRef.current) return;
    const painter = svgPainter(svgRef.current, view);
    spec.draw(painter, model, t, p);
    // the key moment being shown: a ring around the place and its label
    const h = holds.find((k, i) => holding === i || Math.abs(t - k.at) < 1e-9);
    if (h) {
      if (h.where) {
        painter.circle(h.where[0], h.where[1], 22, { fill: "none", tone: "runner", w: 3, dash: "5 4" });
        painter.heb(h.where[0], h.where[1], h.label, { tone: "runner", size: 14, dyPx: -32 });
      } else painter.textPx(view.w / 2, 26, h.label, { tone: "runner", size: 15, heb: true });
    }
    // view is derived from spec
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, model, t, p, holding, holds]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (now < holdUntil.current) { raf = requestAnimationFrame(frame); return; }
      if (holdUntil.current) { holdUntil.current = 0; setHolding(null); }
      setT((prev) => {
        const next = prev + dt / (P.pace * (slow ? 2.5 : 1));
        // stop for a moment at the next key moment on the way
        const i = holds.findIndex((h) => !passed.current.has(h.at) && h.at > prev - 1e-12 && h.at <= Math.min(next, end));
        if (i >= 0) {
          passed.current.add(holds[i].at);
          holdUntil.current = now + (holds[i].secs ?? 1.4) * 1000 * (slow ? 1.5 : 1);
          setHolding(i);
          return holds[i].at;
        }
        if (next >= end) {
          setPlaying(false);
          return end;
        }
        return next;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, slow, end, P.pace, holds]);

  const play = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(end);
      return;
    }
    if (t >= end - 1e-9) { setT(start); passed.current.clear(); }
    setPlaying(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <svg
        ref={svgRef}
        data-uid={`${spec.id}-${p}`}
        viewBox={`0 0 ${view.w} ${view.h}`}
        role="img"
        aria-label={P.caption}
        className="ltr block h-auto w-full rounded-xl border border-line bg-surface"
      />
      <p className="text-sm">{P.caption}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => (playing ? setPlaying(false) : play())} className="min-h-11 rounded-lg bg-cta px-4 text-sm font-bold text-on-cta">
          {playing ? "⏸ עצירה" : t >= end - 1e-9 ? "↺ שוב" : t > start ? "▶ המשך" : "▶ הפעלת ההנפשה"}
        </button>
        <button
          type="button"
          aria-pressed={slow}
          onClick={() => setSlow((s) => !s)}
          className={`min-h-11 rounded-lg border px-4 text-sm font-bold ${slow ? "border-accent bg-accent-soft text-accent" : "border-line"}`}
        >
          הילוך איטי
        </button>
        {!P.hideClock && <span className="ltr ms-auto rounded-md bg-accent-soft px-2.5 py-1 font-mono text-sm">t = {t.toFixed(2)} s</span>}
      </div>
    </div>
  );
}
