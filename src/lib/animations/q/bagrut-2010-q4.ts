import { body, simulate, type AnimSpec, type Model, type State } from "../engine";
import { askLabel, askSpan } from "../kits";

/**
 * 2010 q4: 1.5 kg let go at A (H = 3 m); smooth down to C (h = 1 m), then a rough level part CD (1 m, μk = 0.3), then a
 * spring at D that it compresses 0.1 m (to F). Back out, back across CD, and up the smooth part to 2.4 m.
 * The story starts at C (√40 m/s): build 1: constant deceleration on CD, the spring's oscillation (k = 5100 N/m),
 * deceleration back across CD; build 2: friction and the spring's force, step by step. x: distance from C.
 */
const g = 10, m = 1.5, mu = 0.3, L = 1, k = 5100, hC = 1;
const vC = Math.sqrt(2 * g * 2), a = mu * g;
const vD = Math.sqrt(vC * vC - 2 * a * L), w = Math.sqrt(k / m);
const tD = (vC - vD) / a, tF = tD + Math.PI / (2 * w), tOut = tD + Math.PI / w, tBack = tOut + (vD - Math.sqrt(vD * vD - 2 * a * L)) / a;
const formula = (): Model => {
  const state = (tq: number): State => {
    const t = Math.min(Math.max(tq, 0), tBack);
    if (t <= tD) return { b: body(vC * t - 0.5 * a * t * t, 0, vC - a * t, 0) };
    if (t <= tOut) { const u = t - tD; return { b: body(L + (vD / w) * Math.sin(w * u), 0, vD * Math.cos(w * u), 0) }; }
    const u = t - tOut; return { b: body(L - vD * u + 0.5 * a * u * u, 0, -vD + a * u, 0) };
  };
  const vBack = vD * vD - 2 * a * L;
  return { state, events: { D: tD, F: tF, out: tOut, C: tBack }, values: { vC, vD, DF: vD / w, hUp: hC + vBack / (2 * g) } };
};
const simulation = (): Model => {
  const res = simulate({
    init: { b: body(0, 0, vC, 0) },
    accel: (s) => {
      const x = s.b.x, v = s.b.vx;
      const fr = x < L ? -Math.sign(v) * a : 0, sp = x > L ? (-k * (x - L)) / m : 0;
      return { b: { ax: fr + sp, ay: 0 } };
    },
    events: [
      { name: "D", when: (s) => s.b.x >= L, record: (s) => ({ vD: s.b.vx }) },
      { name: "F", when: (s, _t, f) => f.has("D") && s.b.vx <= 0, record: (s) => ({ DF: s.b.x - L }) },
      { name: "out", when: (s, _t, f) => f.has("F") && s.b.x <= L },
      { name: "C", when: (s, _t, f) => f.has("out") && s.b.x <= 0, stop: true, record: (s) => ({ hUp: hC + s.b.vx ** 2 / (2 * g) }) },
    ],
    tMax: 5,
    dt: 2e-6,
  });
  res.model.values.vC = vC;
  return res.model;
};
const Ax = -2.6;
export const spec: AnimSpec = {
  id: "bagrut-2010-q4",
  view: { x0: -3.0, x1: 1.6, y0: -0.2, y1: 3.4 },
  formula,
  simulation,
  order: ["D", "F", "out", "C"],
  scale: 1,
  tolTime: 2e-3,
  answers: { vD: [5.830951894845301, 1e-6], DF: [0.1, 1e-3], hUp: [2.4, 1e-3] },
  parts: [
    { to: (mm) => mm.events.F, pace: 1, caption: "אילו סוגי אנרגיה יש לגוף בכל אחת מהנקודות A, B, C, D, F?" },
    { to: () => 0.02, pace: 1, caption: "מה המהירות של הגוף בנקודה C, בדרכו אל F?" },
    { to: (mm) => mm.events.D, pace: 1, caption: "מה המהירות בנקודה D?" },
    { to: (mm) => mm.events.F, pace: 1, caption: "הגוף נעצר לרגע ב-F, אחרי שכיווץ את הקפיץ ב-0.1 m. מה קבוע הקפיץ?" },
    { to: (mm) => mm.events.C, pace: 1, caption: "הגוף חוזר. לאיזה גובה הוא עולה אחרי שעזב את הקפיץ?" },
    { to: (mm) => mm.events.F, pace: 1, caption: "קפיץ קשה יותר, באותו אורך. האם הגובה שאליו יעלה יהיה קטן, גדול או שווה?" },
  ],
  draw: (P, mm, t, part) => {
    // the smooth part: from A (3 m) down to B and to C (1 m), drawn as a curve; then CD and the spring
    const curve: [number, number][] = Array.from({ length: 41 }, (_, i) => { const u = i / 40; return [Ax + (0 - Ax) * u, hC + (3 - hC) * (1 - u) ** 2 - 0.6 * Math.sin(Math.PI * u) ** 2] as [number, number]; });
    P.poly(curve, { close: false, fill: "none", tone: "line", w: 2.4 });
    P.line(0, hC, L, hC, { tone: "line", w: 2.4 }); P.poly([[0, hC], [L, hC], [L, hC - 0.06], [0, hC - 0.06]], { tone: "soft", fill: "soft" });
    P.line(L, hC, 1.5, hC, { tone: "line", w: 2.4 });
    P.wall(1.5, hC, hC + 0.4, "right");
    const b = mm.state(t).b;
    const springStart = Math.max(L, b.x) + 0.04;
    P.spring(springStart, hC + 0.12, 1.5, hC + 0.12, { coils: 7, ampPx: 5 });
    P.block(b.x, hC, { wPx: 18, hPx: 16 });
    for (const [l, x, y] of [["A", Ax, 3], ["C", 0, hC], ["D", L, hC], ["F", L + 0.1, hC]] as const) P.mono(x, y, l, { tone: "data", size: 11, dyPx: l === "A" ? -10 : 16 });
    P.line(-2.9, 0, 1.5, 0, { tone: "idle", w: 1, dash: "4 4" }); P.mono(-2.9, 0, "MN", { tone: "data", size: 10, dyPx: 14, anchor: "start" });
    if (part === 0) askLabel(P, -1.2, 2.8, "Ek, Ep, Eel ?", 0, 0);
    if (part === 1) askLabel(P, 0, hC, "vC = ?", 0, -30);
    if (part === 2 && t >= mm.events.D - 1e-9) askLabel(P, L, hC, "vD = ?", 0, -30);
    if (part === 3 && t >= mm.events.F - 1e-9) askLabel(P, L + 0.1, hC, "k = ?", 0, -30);
    if (part === 4 && t >= mm.events.C - 1e-9) askSpan(P, -0.3, 0, hC + 1.4, "h = ?", 0);
    if (part === 5) askLabel(P, 1.3, hC + 0.12, "k ↑ ?", 0, -26);
  },
};
