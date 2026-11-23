import { askLabel, spinMotion } from "../kits";

/** 1991 q4: a conical pendulum: string ℓ (drawn 1 m) at α to the vertical (drawn 40°), so ω² = g/(ℓ·cos α). Side view, a little from above. */
const g = 10, l = 1, al = (40 * Math.PI) / 180;
const r = l * Math.sin(al), w = Math.sqrt(g / (l * Math.cos(al)));
const tilt = 0.3;
export const spec = spinMotion({
  id: "bagrut-1991-q4",
  r,
  period: (2 * Math.PI) / w,
  laps: 2,
  answers: { a: [g * Math.tan(al), 1e-6] },
  view: { x0: -1.4, x1: 1.4, y0: -1.25, y1: 0.15 },
  parts: [
    { to: (m) => m.events.lap2, pace: 1.5, caption: "הגוף נע במעגל אופקי, והחוט בזווית α לאנך. אילו כוחות פועלים עליו, ומי מפעיל כל אחד?" },
    { to: (m) => m.events.lap2, pace: 1.5, caption: "מה הביטוי ל-cos α לפי אורך החוט ותדירות הסיבוב?" },
    { to: (m) => m.events.lap2, pace: 1.5, caption: "מאריכים את החוט פי שניים, באותה תדירות. האם המרחק h בין נקודת התלייה למרכז המעגל משתנה?" },
    { to: (m) => m.events.lap2, pace: 1.5, caption: "האם הגוף יכול לנוע במעגל אופקי כשהחוט אופקי?" },
  ],
  draw: (P, c, _m, _t, part) => {
    const yc = -l * Math.cos(al);
    const scr = (x: number, z: number, y: number): [number, number] => [x, y + tilt * z];
    P.line(-0.4, 0, 0.4, 0, { tone: "line", w: 3 });
    P.poly(Array.from({ length: 61 }, (_, i) => { const a = (2 * Math.PI * i) / 60; return scr(r * Math.cos(a), r * Math.sin(a), yc); }), { close: false, fill: "none", tone: "idle", w: 1, dash: "4 4" });
    P.line(0, 0, 0, yc, { tone: "idle", w: 1, dash: "3 3" });
    const p = scr(c.x, c.z, yc);
    P.line(0, 0, p[0], p[1], { tone: "line", w: 1.6 });
    P.circle(p[0], p[1], 8, { fill: "body" });
    P.arrowPx(p[0], p[1], c.vx * 14, -tilt * c.vz * 14, { tone: "vel", label: "v" });
    P.mono(0.06, -0.25, "α", { tone: "data", size: 12 });
    if (part === 0) askLabel(P, p[0], p[1], "?", 16, 16);
    if (part === 1) askLabel(P, 0.5, -0.2, "cos α = ?", 0, 0);
    if (part === 2) { P.mono(-0.06, yc / 2, "h", { tone: "data", size: 12, anchor: "end" }); askLabel(P, 0.5, -0.2, "2ℓ: h ?", 0, 0); }
    if (part === 3) askLabel(P, 0.5, -0.2, "α = 90° ?", 0, 0);
  },
});
