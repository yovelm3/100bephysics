import { body, simulate, type AnimSpec, type Model, type State } from "../engine";
import { askLabel } from "../kits";

/**
 * 1986 q2: A and B (7.5 kg each) touch at 0, each on its own spring (30 N/m), springs relaxed. A is pulled 0.1 m left and
 * let go: it hits B a quarter period later (0.785 s) at 0.2 m/s; they stick (0.1 m/s) and oscillate together on both
 * springs (60 N/m, 15 kg) with amplitude 0.05 m. Build 1: the closed-form oscillations; build 2: the springs' forces,
 * with A and B separate until they touch and then locked together.
 */
const m = 7.5, k = 30, A0 = 0.1, w1 = Math.sqrt(k / m), w2 = Math.sqrt((2 * k) / (2 * m));
const tHit = Math.PI / (2 * w1), V = (A0 * w1) / 2, A2 = V / w2, tEnd = tHit + (2 * Math.PI) / w2;
const formula = (): Model => ({
  state: (tq: number): State => {
    const t = Math.min(Math.max(tq, 0), tEnd);
    if (t <= tHit) return { a: body(-A0 * Math.cos(w1 * t), 0, A0 * w1 * Math.sin(w1 * t), 0), b: body(0, 0, 0, 0) };
    const u = t - tHit, x = A2 * Math.sin(w2 * u), v = A2 * w2 * Math.cos(w2 * u);
    return { a: body(x, 0, v, 0), b: body(x, 0, v, 0) };
  },
  events: { hit: tHit, far: tHit + Math.PI / (2 * w2), back: tHit + (3 * Math.PI) / (2 * w2), end: tEnd },
  values: { V, A2 },
});
const simulation = (): Model => {
  let stuck = false, pv = 0, x1 = 0;
  const res = simulate({
    init: { a: body(-A0, 0, 0, 0), b: body(0, 0, 0, 0) },
    accel: (s) => {
      pv = s.a.vx;
      if (stuck) { const a = (-2 * k * s.a.x) / (2 * m); return { a: { ax: a, ay: 0 }, b: { ax: a, ay: 0 } }; }
      return { a: { ax: (-k * s.a.x) / m, ay: 0 }, b: { ax: (-k * s.b.x) / m, ay: 0 } };
    },
    events: [
      { name: "hit", when: (s) => s.a.x >= s.b.x, then: (s) => { const v = (s.a.vx + s.b.vx) / 2; s.a.vx = v; s.b.vx = v; s.a.x = s.b.x; stuck = true; }, record: (s) => ({ V: (s.a.vx + s.b.vx) / 2 }) },
      { name: "far", when: (s, _t, f) => f.has("hit") && pv > 0 && s.a.vx <= 0, record: (s) => { x1 = s.a.x; return { A2: x1 }; } },
      { name: "back", when: (s, _t, f) => f.has("far") && pv < 0 && s.a.vx >= 0 },
      { name: "end", when: (_s, t) => t >= tEnd - 1e-9, stop: true },
    ],
    tMax: tEnd + 0.2,
    dt: 1e-5,
  });
  return res.model;
};
export const spec: AnimSpec = {
  id: "bagrut-1986-q2",
  view: { x0: -0.6, x1: 0.6, y0: -0.12, y1: 0.48 },
  formula,
  simulation,
  order: ["hit", "far", "back", "end"],
  scale: 0.2,
  answers: { V: [0.1, 1e-6], A2: [0.05, 1e-5] },
  parts: [
    { to: (mm) => mm.events.hit, pace: 1.5, hideClock: true, caption: "מזיזים את A שמאלה 0.1 m ומשחררים. כמה זמן אחרי השחרור הוא מתנגש ב-B?" },
    { to: (mm) => mm.events.hit + 0.15, pace: 1.5, caption: "ההתנגשות פלסטית. מה המהירות המשותפת מיד אחריה?" },
    { to: (mm) => mm.events.end, pace: 1.5, caption: "מה המשרעת של התנועה של שני הגופים אחרי ההתנגשות?" },
    { to: () => 0.3, pace: 1.5, caption: "במקרה אחר: A שמאלה 0.1 m ו-B ימינה 0.2 m, ומשחררים יחד. איפה הם מתנגשים?" },
  ],
  draw: (P, mm, t, part) => {
    P.line(-0.58, 0, 0.58, 0, { tone: "line", w: 2 });
    P.wall(-0.55, 0, 0.18, "left"); P.wall(0.55, 0, 0.18, "right");
    const s = mm.state(t), a = s.a.x - 0.05, b = s.b.x + 0.05;
    P.spring(-0.55, 0.06, a - 0.05, 0.06, { coils: 8, ampPx: 6 }); P.spring(b + 0.05, 0.06, 0.55, 0.06, { coils: 8, ampPx: 6 });
    P.block(a, 0, { wPx: 40, hPx: 30, label: "A" }); P.block(b, 0, { wPx: 40, hPx: 30, label: "B", tone: "b2" });
    P.line(0, -0.02, 0, -0.08, { tone: "idle", w: 1 }); P.mono(0, -0.08, "0", { tone: "data", size: 11, dyPx: 12 });
    const asks = ["t = ?", "V = ?", "A = ?", "x = ?"];
    if (part === 0 && t >= mm.events.hit - 1e-9) askLabel(P, 0, 0.2, asks[0], 0, -10);
    if (part === 1 && t >= mm.events.hit) askLabel(P, 0, 0.2, asks[1], 0, -10);
    if (part === 2) askLabel(P, 0, 0.35, asks[2], 0, 0);
    if (part === 3) askLabel(P, 0, 0.35, asks[3], 0, 0);
  },
};
