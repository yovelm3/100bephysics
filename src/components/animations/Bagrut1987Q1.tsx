"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formulaModel, Q, type Model } from "@/lib/animations/bagrut-1987-q1";

/**
 * Animated figure for bagrut 1987 q1. Shows what happens in each part and marks what is asked ("v = ?").
 * Never shows answers or computed values (owner's rule). Both builds are verified in tests and before every build.
 */
const C = { ball: "#0f766e", ask: "#c2410c", runner: "#2563eb", data: "#7f9a90", ground: "#48665a", text: "#133328", soft: "#cfe9dd", idle: "#9fb8ae" };
const X0 = 110, Y0 = 285, S = 16.5;
const sx = (x: number) => X0 + x * S;
const sy = (y: number) => Y0 - y * S;
const NS = "http://www.w3.org/2000/svg";

type Attrs = Record<string, string | number>;

function painter(svg: SVGSVGElement) {
  const uid = svg.dataset.uid!;
  const el = (tag: string, attrs: Attrs = {}, text?: string) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    if (text !== undefined) e.textContent = text;
    svg.appendChild(e);
    return e;
  };
  const mono = (x: number, y: number, text: string, color = C.text, size = 13, anchor = "middle", weight = 600) =>
    el("text", { x, y, fill: color, "font-size": size, "text-anchor": anchor, "font-family": "var(--font-mono), monospace", "font-weight": weight }, text);
  const heb = (x: number, y: number, text: string, color = C.text, size = 15) =>
    el("text", { x, y, fill: color, "font-size": size, "text-anchor": "middle", "font-family": "var(--font-hebrew), Arial, sans-serif", "font-weight": 700, direction: "rtl" }, text);
  const marker = (id: string, color: string) => {
    const defs = el("defs");
    const mk = document.createElementNS(NS, "marker");
    Object.entries({ id, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" }).forEach(([k, v]) => mk.setAttribute(k, String(v)));
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", "M0,0 L10,5 L0,10 z");
    p.setAttribute("fill", color);
    mk.appendChild(p);
    defs.appendChild(mk);
  };
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, key: string, w = 2.5, both = false) =>
    el("line", { x1, y1, x2, y2, stroke: color, "stroke-width": w, "marker-end": `url(#${uid}-${key})`, ...(both ? { "marker-start": `url(#${uid}-${key})` } : {}) });
  const dim = (x1: number, y1: number, x2: number, y2: number, text: string, color = C.data) => {
    el("line", { x1, y1, x2, y2, stroke: color, "stroke-width": 1.2, "stroke-dasharray": "4 3" });
    if (y1 === y2) mono((x1 + x2) / 2, y1 - 6, text, color, 12, "middle", 500);
    else {
      const t = mono(x1 - 6, (y1 + y2) / 2, text, color, 12, "middle", 500);
      t.setAttribute("transform", `rotate(-90 ${x1 - 6} ${(y1 + y2) / 2})`);
    }
  };
  const scene = () => {
    svg.innerHTML = "";
    marker(`${uid}-ask`, C.ask);
    marker(`${uid}-data`, C.data);
    el("line", { x1: 8, y1: Y0, x2: 712, y2: Y0, stroke: C.ground, "stroke-width": 2 });
    for (let x = 14; x < 712; x += 14) el("line", { x1: x, y1: Y0, x2: x - 8, y2: Y0 + 8, stroke: C.soft, "stroke-width": 1.2 });
    el("rect", { x: sx(-3), y: sy(Q.H), width: 3 * S, height: Q.H * S, fill: "#e8f4ef", stroke: C.ground, "stroke-width": 1.5 });
    dim(sx(-3.8), sy(Q.H), sx(-3.8), sy(0), "7.2 m");
  };
  const person = (x: number, color: string, t: number, moving: boolean) => {
    const px = sx(x), b = Y0, sw = moving ? Math.sin(t * 40) * 7 : 0;
    el("circle", { cx: px, cy: b - 34, r: 6, fill: "none", stroke: color, "stroke-width": 2.2 });
    el("line", { x1: px, y1: b - 28, x2: px - (moving ? 3 : 0), y2: b - 12, stroke: color, "stroke-width": 2.2 });
    el("line", { x1: px, y1: b - 12, x2: px - 6 - sw, y2: b, stroke: color, "stroke-width": 2.2 });
    el("line", { x1: px, y1: b - 12, x2: px + 6 + sw, y2: b, stroke: color, "stroke-width": 2.2 });
    el("line", { x1: px - 8, y1: b - 22 + sw * 0.4, x2: px + 8, y2: b - 22 - sw * 0.4, stroke: color, "stroke-width": 2.2 });
  };
  const ballAt = (x: number, y: number) => el("circle", { cx: sx(x), cy: sy(y) - 6, r: 6, fill: C.ball });
  return { el, mono, heb, arrow, dim, scene, person, ballAt };
}

const PARTS = [
  { end: (m: Model) => m.events.forceOff, slow: 260, caption: "כוח של 1000 N פועל על הכדור במשך 0.01 s. מה המהירות שלו ברגע שהכוח נגמר?" },
  { end: (m: Model) => m.events.catch, slow: 2.6, caption: "ברגע שהכוח מפסיק, הכדור יוצא מהגג והרץ מתחיל לרוץ ממנוחה לעברו. הם נפגשים כשהכדור בגובה 1.2 m. איזו תאוצה צריך הרץ?" },
  { end: (m: Model) => m.events.ground, slow: 2.6, caption: "הפעם הרץ לא תופס. הכדור ממשיך עד הקרקע. באיזה מרחק מנקודת הזריקה הוא פוגע?" },
];

function draw(svg: SVGSVGElement, part: number, model: Model, t: number) {
  const P = painter(svg);
  P.scene();
  const tp = Q.tp;
  const justStarted = t > tp && t < tp + 0.18;
  if (part === 0) {
    P.person(Q.D, C.idle, t, false);
    P.dim(sx(0), Y0 + 22, sx(Q.D), Y0 + 22, "30.5 m");
    const b = model.ball(Math.min(t, tp));
    P.ballAt(b.x, b.y);
    if (t < tp) {
      P.arrow(sx(b.x) - 60, sy(Q.H) - 6, sx(b.x) - 9, sy(Q.H) - 6, C.data, "data", 3);
      P.mono(sx(b.x) - 60, sy(Q.H) - 18, "F = 1000 N", C.data, 12, "start");
    }
    const len = 12 + b.v * 3.2;
    P.arrow(sx(b.x) + 7, sy(Q.H) - 6, sx(b.x) + 7 + len, sy(Q.H) - 6, C.ask, "ask", 3);
    P.mono(sx(b.x) + 12 + len, sy(Q.H) - 14, t >= tp ? "v = ?" : "v ↑", C.ask, 14, "start", 700);
    P.heb(sx(14), sy(Q.H) - 60, t < tp ? "הכוח פועל…" : "הכוח הפסיק");
    return;
  }
  const catchPart = part === 1;
  const tEnd = catchPart ? model.events.catch : model.events.ground;
  const tt = t >= tEnd - 1e-3 ? tEnd : t;
  const b = model.ball(tt, catchPart);
  P.ballAt(b.x, b.y);
  if (t < tp) P.arrow(sx(b.x) - 50, sy(Q.H) - 6, sx(b.x) - 9, sy(Q.H) - 6, C.data, "data", 3);
  if (catchPart) {
    P.dim(sx(0), Y0 + 22, sx(Q.D), Y0 + 22, "30.5 m");
    P.el("line", { x1: sx(20), y1: sy(Q.hCatch), x2: sx(Q.D + 1.5), y2: sy(Q.hCatch), stroke: C.data, "stroke-width": 1, "stroke-dasharray": "3 4" });
    P.mono(sx(Q.D + 1.6), sy(Q.hCatch) + 4, "1.2 m", C.data, 12, "start", 500);
    const r = model.runner(tt);
    P.person(r.x, C.runner, t, r.moving && t < tEnd);
    if (r.moving) {
      P.arrow(sx(r.x) - 10, Y0 - 50, sx(r.x) - 40, Y0 - 50, C.ask, "ask", 2.5);
      P.mono(sx(r.x) - 26, Y0 - 58, "a = ?", C.ask, 13, "middle", 700);
    }
    if (justStarted) {
      P.heb(sx(r.x), Y0 - 76, "מתחיל לרוץ!", C.runner, 15);
      P.heb(sx(3), sy(Q.H) - 40, "יוצא מהגג!", C.ball, 15);
    }
    if (t < tp) P.heb(sx(14), sy(Q.H) - 60, "הכוח פועל…");
  } else {
    P.person(Q.D, C.idle, t, false);
    if (t >= tEnd - 1e-3) {
      P.arrow(sx(0), Y0 + 26, sx(model.xGround), Y0 + 26, C.ask, "ask", 2, true);
      P.mono(sx(model.xGround / 2), Y0 + 20, "x = ?", C.ask, 14, "middle", 700);
    } else P.dim(sx(0), Y0 + 22, sx(Q.D), Y0 + 22, "30.5 m");
    if (justStarted) P.heb(sx(3), sy(Q.H) - 40, "יוצא מהגג!", C.ball, 15);
  }
}

export default function Bagrut1987Q1({ part }: { part: number }) {
  const model = useMemo(() => formulaModel(), []);
  const svgRef = useRef<SVGSVGElement>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  const p = Math.min(Math.max(part, 0), PARTS.length - 1);
  const end = PARTS[p].end(model);

  useEffect(() => {
    if (svgRef.current) draw(svgRef.current, p, model, t);
  }, [p, model, t]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => {
        const next = prev + dt / (PARTS[p].slow * (slow ? 2.5 : 1));
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
  }, [playing, p, slow, end]);

  const play = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(end);
      return;
    }
    if (t >= end) setT(0);
    setPlaying(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <svg
        ref={svgRef}
        data-uid={`anim1987-${p}`}
        viewBox="0 0 720 330"
        role="img"
        aria-label={PARTS[p].caption}
        className="ltr block h-auto w-full rounded-xl border border-line bg-surface"
      />
      <p className="text-sm">{PARTS[p].caption}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => (playing ? setPlaying(false) : play())} className="min-h-11 rounded-lg bg-cta px-4 text-sm font-bold text-on-cta">
          {playing ? "⏸ עצירה" : t >= end ? "↺ שוב" : t > 0 ? "▶ המשך" : "▶ הפעלת ההנפשה"}
        </button>
        <button
          type="button"
          aria-pressed={slow}
          onClick={() => setSlow((s) => !s)}
          className={`min-h-11 rounded-lg border px-4 text-sm font-bold ${slow ? "border-accent bg-accent-soft text-accent" : "border-line"}`}
        >
          הילוך איטי
        </button>
        <span className="ltr ms-auto rounded-md bg-accent-soft px-2.5 py-1 font-mono text-sm">t = {t.toFixed(3)} s</span>
      </div>
    </div>
  );
}
