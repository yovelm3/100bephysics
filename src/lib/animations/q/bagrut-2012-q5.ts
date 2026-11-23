import { body } from "../engine";
import { askLabel, spinMotion, storySpec, joinSpecs } from "../kits";

/**
 * 2012 q5: a disk turning at 90 rpm (1.5 Hz); a 5 g coin on it, μs = 0.6. The largest radius: μs·g/ω².
 * Part ג: the coin at that radius, the frequency raised slowly from zero (drawn: f² grows 0.5 Hz² per second);
 * static friction m·ω²·r grows until it reaches μs·m·g, at f² = 2.25 Hz². The model's q.x is f².
 */
const g = 10, mu = 0.6, m = 0.005, f = 1.5;
const w = 2 * Math.PI * f, rMax = (mu * g) / (w * w);
const top = (P: Parameters<Parameters<typeof spinMotion>[0]["draw"]>[0], cx: number, cz: number, label: string | null) => {
  P.ring(0, 0, 0.12, { tone: "line", w: 2 });
  P.circle(0, 0, 3, { fill: "line" });
  P.circle(cx, cz, 7, { fill: "runner" });
  if (label) askLabel(P, cx, cz, label, 14, -16);
};
const turning = spinMotion({
  id: "bagrut-2012-q5",
  r: rMax,
  period: 1 / f,
  laps: 3,
  answers: { a: [mu * g, 1e-6] },
  view: { x0: -0.2, x1: 0.2, y0: -0.14, y1: 0.14 },
  parts: [
    { to: (mm) => mm.events.lap3, pace: 2, caption: "המטבע מסתובב יחד עם הדסקה. אילו כוחות פועלים עליו, ומי מפעיל כל אחד?" },
    { to: (mm) => mm.events.lap3, pace: 2, caption: "מה המרחק הגדול ביותר מהציר שבו המטבע לא מחליק?" },
    { to: (mm) => mm.events.lap3, pace: 2, caption: "אילו המטבע היה כבד יותר, האם הגרף היה משתנה?" },
  ],
  draw: (P, c, _m, _t, part) => top(P, c.x, c.z, part === 0 ? "?" : part === 1 ? "r max = ?" : "m ↑ ?"),
});
const rate = 0.5, f2Slip = (mu * g) / (4 * Math.PI ** 2 * rMax);
const speedUp = storySpec({
  id: "bagrut-2012-q5",
  view: { x0: -0.2, x1: 0.2, y0: -0.14, y1: 0.14 },
  scale: 3,
  story: {
    init: { q: body(0, 0, rate, 0) },
    // build 2: the friction needed, m·4π²f²·r, against the most static friction can give, μs·m·g
    phases: [{ end: "slip", acc: {}, dur: () => f2Slip / rate, force: () => ({}), until: (s) => m * 4 * Math.PI ** 2 * s.q.x * rMax >= mu * m * g }],
    record: { f2: ["slip", (s) => s.q.x], fB: ["slip", (s) => m * 4 * Math.PI ** 2 * s.q.x * rMax] },
  },
  order: ["slip"],
  answers: { f2: [2.25, 1e-3], fB: [0.03, 1e-4] },
  parts: [
    { to: (mm) => mm.events.slip, pace: 1, caption: "מגדילים את התדירות לאט מאפס. באיזה ערך של f² המטבע מתחיל להחליק?" },
    { to: (mm) => mm.events.slip, pace: 1, caption: "מה כוח החיכוך בנקודה B?" },
  ],
  draw: (P, mm, t, part) => {
    // the turned angle: f² = rate·t, so f = √(rate·t) and the angle is 2π·∫f dt
    const ang = 2 * Math.PI * (2 / 3) * Math.sqrt(rate) * Math.pow(Math.max(t, 0), 1.5);
    top(P, rMax * Math.cos(ang), rMax * Math.sin(ang), part === 0 ? "f² = ?" : "f(B) = ?");
    void mm;
  },
});
export const spec = joinSpecs("bagrut-2012-q5", [{ key: "turn", spec: turning, parts: [0, 1, 2] }, { key: "up", spec: speedUp, parts: [0, 1] }], [["turn", 0], ["turn", 1], ["up", 0], ["up", 1], ["turn", 2]]);
