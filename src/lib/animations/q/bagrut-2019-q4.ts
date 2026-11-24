import { body, simulate, type AnimSpec, type Model, type State } from "../engine";
import { askLabel } from "../kits";

/**
 * 2019 q4: a 2 kg box sent at 5 m/s from A up a smooth slope (drawn straight, 30°) to B, 0.8 m high (3 m/s there);
 * from B a fan's wind pushes back with F = 2x N (x from B), so it stops at C, 3 m on, and comes back: it reaches A again
 * at 5 m/s. Build 1: the slope's constant deceleration, and on BD the oscillation x = 3·sin(t) (ω = √(2/2) = 1);
 * build 2: the forces step by step. The model's b.x is the distance along the track from A.
 */
const g = 10, m = 2, k = 2, h = 0.8, th = Math.PI / 6;
const Ls = h / Math.sin(th), gs = g * Math.sin(th);
const v0 = 5, vB = Math.sqrt(v0 * v0 - 2 * gs * Ls), w = Math.sqrt(k / m);
const tB = (v0 - vB) / gs, tC = tB + Math.PI / (2 * w), tB2 = tB + Math.PI / w, tA = tB2 + tB;
const formula = (): Model => {
  const state = (tq: number): State => {
    const t = Math.min(Math.max(tq, 0), tA);
    if (t <= tB) return { b: body(v0 * t - 0.5 * gs * t * t, 0, v0 - gs * t, 0) };
    if (t <= tB2) { const u = t - tB; return { b: body(Ls + (vB / w) * Math.sin(w * u), 0, vB * Math.cos(w * u), 0) }; }
    const u = t - tB2; return { b: body(Ls - vB * u - 0.5 * gs * u * u, 0, -vB - gs * u, 0) };
  };
  return { state, events: { B: tB, C: tC, B2: tB2, A: tA }, values: { BC: vB / w, W: -0.5 * m * vB * vB, vA: v0 } };
};
const simulation = (): Model => {
  const res = simulate({
    init: { b: body(0, 0, v0, 0) },
    accel: (s) => ({ b: { ax: s.b.x < Ls ? -gs : (-k * (s.b.x - Ls)) / m, ay: 0 } }),
    events: [
      { name: "B", when: (s) => s.b.x >= Ls },
      { name: "C", when: (s, _t, f) => f.has("B") && s.b.vx <= 0, record: (s) => ({ BC: s.b.x - Ls, W: -0.5 * k * (s.b.x - Ls) ** 2 }) },
      { name: "B2", when: (s, _t, f) => f.has("C") && s.b.x <= Ls },
      { name: "A", when: (s, _t, f) => f.has("B2") && s.b.x <= 0, stop: true, record: (s) => ({ vA: -s.b.vx }) },
    ],
    tMax: 10,
    dt: 1e-5,
  });
  return res.model;
};
const place = (x: number): [number, number] => (x <= Ls ? [x * Math.cos(th), x * Math.sin(th)] : [Ls * Math.cos(th) + (x - Ls), h]);
export const spec: AnimSpec = {
  id: "bagrut-2019-q4",
  view: { x0: -0.4, x1: 6.4, y0: -0.3, y1: 3.1 },
  formula,
  simulation,
  order: ["B", "C", "B2", "A"],
  scale: 5,
  answers: { BC: [3, 1e-6], W: [-9, 1e-6], vA: [5, 1e-6] },
  parts: [
    { to: (mm) => mm.events.B, pace: 1, caption: "מה המהירות הקטנה ביותר שצריך לתת לתיבה ב-A, כדי שתגיע ל-B?" },
    { to: (mm) => mm.events.C, pace: 1, caption: "v0 = 5 m/s. מ-B פועלת הרוח, והתיבה נעצרת לרגע ב-C. מה העבודה של הכוח F(x) מ-B עד C?" },
    { to: (mm) => mm.events.C, pace: 1, caption: "מה המרחק בין C ל-B?" },
    { from: (mm) => mm.events.C, to: (mm) => mm.events.B2, pace: 1, caption: "מ-C התיבה חוזרת אל B. האם התאוצה קבועה? האם המהירות גדלה או קטנה?" },
    { to: (mm) => mm.events.A, pace: 1, caption: "מה המהירות של התיבה כשהיא חוזרת ל-A?" },
  ],
  draw: (P, mm, t, part) => {
    const B = place(Ls);
    P.line(-0.3, 0, 0, 0, { tone: "line", w: 2.4 });
    P.line(0, 0, B[0], B[1], { tone: "line", w: 2.4 });
    P.line(B[0], h, B[0] + 4.1, h, { tone: "line", w: 2.4 });
    P.block(B[0] + 4.2, h, { wPx: 16, hPx: 30, tone: "line" });
    P.heb(B[0] + 4.2, h + 0.5, "מאוורר", { tone: "data", size: 10 });
    for (const [l, p] of [["A", [0, 0]], ["B", B], ["D", [B[0] + 4, h]]] as const) P.mono(p[0], p[1], l, { tone: "data", size: 11, dyPx: 16 });
    // the question's graph: F grows linearly from 0 at B to 8 N at D
    const G = P.graph({ xPx: 380, yPx: 24, wPx: 280, hPx: 110, tMax: 4.3, vMin: 0, vMax: 9, xLabel: "x (m)", yLabel: "F (N)" });
    P.path([[G.gx(0), G.gy(0)], [G.gx(4), G.gy(8)]], { tone: "body", w: 2.2 });
    P.textPx(G.gx(4), G.gy(0) + 13, "4", { tone: "data", size: 10 }); P.textPx(376, G.gy(8) + 4, "8", { tone: "data", size: 10, anchor: "end" });
    const b = mm.state(t).b, [x, y] = place(b.x);
    P.block(x, y, { wPx: 22, hPx: 16, angle: b.x < Ls ? th : 0 });
    if (b.x > Ls) P.arrowPx(x - 0.12, y + 0.12, -(8 + 6 * (b.x - Ls)), 0, { tone: "force", label: "F" });
    if (part === 0) askLabel(P, 0, 0, "v0 min = ?", 30, -30);
    if (part === 1 && t >= mm.events.C - 1e-9) askLabel(P, x, y, "W(F) = ?", 0, -40);
    if (part === 2 && t >= mm.events.C - 1e-9) askLabel(P, (B[0] + x) / 2, h, "BC = ?", 0, 30);
    if (part === 3) askLabel(P, x, y, "a ?, v ?", 0, -40);
    if (part === 4 && t >= mm.events.A - 1e-9) askLabel(P, 0, 0, "v = ?", 30, -30);
  },
};
