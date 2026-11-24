import { body, simulate, type AnimSpec, type Model, type State } from "../engine";
import { askLabel } from "../kits";

/**
 * 2001 q5: Skylab's mass meter: a chair on a spring (K = 600 N/m) in the spacecraft (weightless), the astronaut tied to
 * it, oscillating. Drawn: astronaut 72 kg, chair 30.7 kg, so T = 2π√((M + m)/K) = 2.6 s; amplitude 0.2 m.
 * Build 1: x = A·cos(ωt); build 2: the spring's force, step by step.
 */
const K = 600, M = 72.04, m = 30.7, A = 0.2;
const w = Math.sqrt(K / (M + m)), T = (2 * Math.PI) / w;
const formula = (): Model => ({
  state: (t: number): State => ({ c: body(A * Math.cos(w * Math.max(0, t)), 0, -A * w * Math.sin(w * Math.max(0, t)), 0) }),
  events: { half: T / 2, full: T, two: 2 * T },
  values: { T },
});
const simulation = (): Model => {
  let crossings = 0, prev = A;
  const res = simulate({
    init: { c: body(A, 0, 0, 0) },
    accel: (s) => { prev = s.c.vx; return { c: { ax: (-K * s.c.x) / (M + m), ay: 0 } }; },
    events: [
      { name: "half", when: (s) => prev < 0 && s.c.vx >= 0 && ++crossings === 1 },
      { name: "full", when: (s, _t, f) => f.has("half") && s.c.vx <= 0 && s.c.x > 0 },
      { name: "two", when: (s, t, f) => f.has("full") && t > 1.75 * T && s.c.vx <= 0 && s.c.x > 0, stop: true },
    ],
    tMax: 3 * T,
    dt: T / 2e5,
  });
  res.model.values.T = res.model.events.full;
  return res.model;
};
export const spec: AnimSpec = {
  id: "bagrut-2001-q5",
  view: { x0: -0.7, x1: 0.7, y0: -0.25, y1: 0.45 },
  formula,
  simulation,
  order: ["half", "full", "two"],
  scale: 0.4,
  answers: { T: [2.6, 2e-3] },
  parts: [
    { to: (mm) => mm.events.two, pace: 1, hideClock: true, caption: "זמן המחזור של אסטרונאוט מסוים 2.6 s. מה המסה שלו?" },
    { to: (mm) => mm.events.two, pace: 1, hideClock: true, caption: "מה זמן המחזור אם המשרעת קטנה פי שניים?" },
    { to: (mm) => mm.events.two, pace: 1, hideClock: true, caption: "מה זמן המחזור עם קפיץ שהקבוע שלו גדול פי ארבעה?" },
    { to: (mm) => mm.events.two, pace: 1, caption: "הראו את הקשר בין המסה M לזמן המחזור T." },
    { to: (mm) => mm.events.two, pace: 1, caption: "K = 600 N/m. בעזרת הגרף: מה המסה של הכיסא?" },
    { to: (mm) => mm.events.two, pace: 1, caption: "למה בחללית לא שוקלים את האסטרונאוטים במאזני קפיץ?" },
  ],
  draw: (P, mm, t, part) => {
    P.wall(-0.6, -0.1, 0.3, "left");
    const x = mm.state(t).c.x;
    P.spring(-0.6, 0.1, x - 0.1, 0.1, { coils: 10, ampPx: 8 });
    P.block(x, 0.1, { wPx: 44, hPx: 40, base: false, tone: "b2" });
    P.person(x, 0.0, t, { tone: "runner" });
    P.line(0, -0.15, 0, -0.05, { tone: "idle", w: 1 });
    const asks = ["M = ?", "T ?", "T ?", "M(T) ?", "m = ?", "?"];
    askLabel(P, 0.3, 0.38, asks[part], 0, 0);
  },
};
