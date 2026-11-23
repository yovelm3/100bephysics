import { body, simulate, type AnimSpec, type Model, type State } from "../engine";
import { askLabel } from "../kits";

/**
 * 1986 q1: m = 2 kg moves at 3 m/s on a smooth floor; a force growing as F = 1.5·t N (6 N at 4 s) starts to act.
 * Three cases: along v0, against v0, perpendicular to v0. Build 1: integrals of a = F/m (v = v0 ± 0.375 t², x = v0 t ± t³/8).
 * Build 2: step by step with the force from the graph.
 */
const m = 2, v0 = 3, k = 1.5, T = 4;
const dv = (t: number) => (k * t * t) / (2 * m), dx = (t: number) => (k * t * t * t) / (6 * m);
const Y = { along: 1.2, against: -1.4, side: -4.2 };

const formula = (): Model => {
  const state = (tq: number): State => {
    const t = Math.min(Math.max(tq, 0), T);
    return {
      along: body(v0 * t + dx(t), Y.along, v0 + dv(t), 0),
      against: body(v0 * t - dx(t), Y.against, v0 - dv(t), 0),
      side: body(v0 * t, Y.side + dx(t), v0, dv(t)),
    };
  };
  const turn = Math.sqrt((2 * m * v0) / k);
  const e = state(T);
  return {
    state,
    events: { turn, end: T },
    values: { v1: e.along.vx, v2: e.against.vx, v3: Math.hypot(e.side.vx, e.side.vy), ang3: (Math.atan2(e.side.vy, e.side.vx) * 180) / Math.PI, a: (k * T) / m },
  };
};
const simulation = (): Model => {
  const res = simulate({
    init: { along: body(0, Y.along, v0, 0), against: body(0, Y.against, v0, 0), side: body(0, Y.side, v0, 0) },
    accel: (_s, t) => { const a = (k * t) / m; return { along: { ax: a, ay: 0 }, against: { ax: -a, ay: 0 }, side: { ax: 0, ay: a } }; },
    events: [
      { name: "turn", when: (s) => s.against.vx <= 0 },
      { name: "end", when: (_s, t) => t >= T - 1e-12, stop: true, record: (s, t) => ({ v1: s.along.vx, v2: s.against.vx, v3: Math.hypot(s.side.vx, s.side.vy), ang3: (Math.atan2(s.side.vy, s.side.vx) * 180) / Math.PI, a: (k * t) / m }) },
    ],
    tMax: 5,
    dt: 1e-5,
  });
  return res.model;
};

export const spec: AnimSpec = {
  id: "bagrut-1986-q1",
  view: { x0: -2, x1: 22, y0: -5.5, y1: 6.5 },
  formula,
  simulation,
  order: ["turn", "end"],
  scale: 16,
  answers: { v1: [9, 1e-9], v2: [-3, 1e-9], a: [3, 1e-9] },
  parts: [
    { to: () => T, pace: 1, caption: "הכוח גדל עם הזמן, לפי הגרף. איזו תנועה זו: קצובה, שוות תאוצה, או בתאוצה משתנה?" },
    { to: () => T, pace: 1, caption: "שלושה מקרים: הכוח בכיוון המהירות, נגדה, או ניצב לה. מה המהירות ומה התאוצה ארבע שניות אחרי שהכוח מתחיל?" },
  ],
  draw: (P, mm, t, part) => {
    // the question's graph: F grows from 0 to 6 N in 4 s
    const G = P.graph({ xPx: 70, yPx: 18, wPx: 170, hPx: 90, tMax: 4.5, vMin: 0, vMax: 6.5, xLabel: "t (s)", yLabel: "F (N)" });
    P.path([[G.gx(0), G.gy(0)], [G.gx(4), G.gy(6)]], { tone: "soft", w: 2 });
    P.path([[G.gx(0), G.gy(0)], [G.gx(Math.min(t, 4)), G.gy(k * Math.min(t, 4))]], { tone: "body", w: 2.6 });
    for (const tt of [1, 2, 3, 4]) P.textPx(G.gx(tt), G.gy(0) + 13, String(tt), { tone: "data", size: 10 });
    for (const f of [2, 4, 6]) P.textPx(66, G.gy(f) + 4, String(f), { tone: "data", size: 10, anchor: "end" });
    const s = mm.state(t), F = k * Math.min(t, T);
    const rows = [["along", [1, 0], "(1)"], ["against", [-1, 0], "(2)"], ["side", [0, 1], "(3)"]] as const;
    for (const [key, [fx, fy], lab] of rows) {
      const b = s[key];
      if (part === 0 && key !== "along") continue;
      if (key === "side") {
        const path = Array.from({ length: 41 }, (_, i) => { const q = mm.state((Math.min(t, T) * i) / 40).side; return [q.x, q.y] as [number, number]; });
        P.poly(path, { close: false, fill: "none", tone: "soft", w: 1.4, dash: "4 4" });
      } else P.line(-1, b.y, 21.5, b.y, { tone: "line", w: 1 });
      P.block(b.x, b.y, { wPx: 24, hPx: 18, base: false });
      P.mono(-1.2, Y[key], lab, { tone: "data", size: 12, anchor: "end", dyPx: 4 });
      if (F > 0.05) P.arrowPx(b.x, b.y, fx * F * 9, -fy * F * 9, { tone: "force", label: "F" });
      const vpx = Math.hypot(b.vx, b.vy);
      if (vpx > 0.05) P.arrowPx(b.x, b.y + 0.9, b.vx * 5, -b.vy * 5, { tone: "vel", label: "v" });
      if (part === 1 && t >= T - 1e-9) askLabel(P, b.x, b.y, "v = ?, a = ?", key === "along" ? -110 : 20, 26);
    }
    if (part === 0) askLabel(P, s.along.x, s.along.y, "a(t) ?", 20, 26);
  },
};
