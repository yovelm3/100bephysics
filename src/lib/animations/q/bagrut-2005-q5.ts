import { body, simulate, type AnimSpec, type Model, type State } from "../engine";
import { askLabel, askSpan } from "../kits";

/**
 * 2005 q5: a bungee jump from a beam 77 m high; 60 kg, K = 100 N/m, the cord 45 m long; he turns at 2 m above the ground.
 * Build 1: free fall to the cord's length, then the cord's oscillation y = 26 + C·cos(ω(t − t1)) + S·sin(…), ω = √(K/m),
 * then free flight up again. Build 2: weight and the cord's pull (only when stretched), step by step.
 */
const g = 10, m = 60, K = 100, H = 77, L0 = 45;
const yT = H - L0, w = Math.sqrt(K / m), yEq = yT - (m * g) / K;
const t1 = Math.sqrt((2 * L0) / g), v1 = -g * t1;
const C = yT - yEq, S = v1 / w;
const Amp = Math.hypot(C, S), ph = Math.atan2(-S, C); // y − yEq = Amp·cos(w·u + ph)
const uLow = (Math.PI - ph) / w, uBack = (2 * Math.PI - 2 * ph) / w; // back at the cord's length, going up
const tLow = t1 + uLow, tBack = t1 + uBack, tTop = tBack + t1;
const formula = (): Model => {
  const state = (tq: number): State => {
    const t = Math.min(Math.max(tq, 0), tTop);
    if (t <= t1) return { b: body(0, H - 0.5 * g * t * t, 0, -g * t) };
    if (t <= tBack) { const u = t - t1; return { b: body(0, yEq + Amp * Math.cos(w * u + ph), 0, -Amp * w * Math.sin(w * u + ph)) }; }
    const u = t - tBack; return { b: body(0, yT + -v1 * u - 0.5 * g * u * u, 0, -v1 - g * u) };
  };
  return { state, events: { taut: t1, eq: t1 + (Math.PI / 2 - ph) / w, low: tLow, slack: tBack, top: tTop }, values: { yLow: yEq - Amp, Fnet: K * (yT - (yEq - Amp)) - m * g, up: tTop - tLow } };
};
const simulation = (): Model => {
  const res = simulate({
    init: { b: body(0, H, 0, 0) },
    accel: (s) => ({ b: { ax: 0, ay: -g + (s.b.y < yT ? (K * (yT - s.b.y)) / m : 0) } }),
    events: [
      { name: "taut", when: (s) => s.b.y <= yT },
      { name: "eq", when: (s) => s.b.y <= yEq },
      { name: "low", when: (s, _t, f) => f.has("taut") && s.b.vy >= 0, record: (s) => ({ yLow: s.b.y, Fnet: K * (yT - s.b.y) - m * g }) },
      { name: "slack", when: (s, _t, f) => f.has("low") && s.b.y >= yT },
      { name: "top", when: (s, _t, f) => f.has("slack") && s.b.vy <= 0, stop: true },
    ],
    tMax: 20,
    dt: 1e-4,
  });
  res.model.values.up = res.model.events.top - res.model.events.low;
  return res.model;
};
export const spec: AnimSpec = {
  id: "bagrut-2005-q5",
  view: { x0: -60, x1: 60, y0: -3, y1: 82 },
  formula,
  simulation,
  order: ["taut", "eq", "low", "slack", "top"],
  scale: 77,
  // part ה waits for the owner's decision (a spring that also pushes, or a rubber cord), so its window ends where the
  // cord would go slack, where the two readings part
  answers: { yLow: [2, 1e-6], Fnet: [2400, 1e-6] },
  parts: [
    { to: (mm) => mm.events.low, pace: 0.4, caption: "K = 100 N/m. מה המשמעות של הנתון הזה?" },
    { to: (mm) => mm.events.low, pace: 0.4, caption: "יצחק נופל וחוזר למעלה בגובה 2 m מעל הקרקע. מה האורך של הקפיץ הרפוי?" },
    { to: (mm) => mm.events.low, pace: 0.4, caption: "מה הכוח השקול על יצחק בגובה 2 m, בגודל ובכיוון?" },
    { to: (mm) => mm.events.low, pace: 0.4, caption: "באיזה גובה הכוח השקול עליו אפס?" },
    { from: (mm) => mm.events.low, to: (mm) => mm.events.slack, pace: 0.4, hideClock: true, caption: "כמה זמן לוקח לו לעלות מהנקודה הנמוכה ביותר לנקודה הגבוהה ביותר?" },
  ],
  draw: (P, mm, t, part) => {
    P.ground(0, -58, 58);
    P.line(-12, H, 6, H, { tone: "line", w: 5 });
    const b = mm.state(t).b;
    if (b.y < yT) P.spring(0, H, 0, b.y + 1, { coils: 14, ampPx: 6 }); else P.poly([[0, H], [2.5, (H + b.y) / 2], [0, b.y + 1]], { close: false, fill: "none", tone: "line", w: 1.4 });
    P.circle(0, b.y, 7, { fill: "runner" });
    if (Math.abs(b.vy) > 0.5) P.arrowPx(5, b.y, 0, -b.vy * 1.6, { tone: "vel", label: "v" });
    P.dim(30, 0, 30, H, "77 m", { offPx: 0 });
    const low = t >= mm.events.low - 1e-9;
    if (part === 0) askLabel(P, 0, (H + b.y) / 2, "K = 100 ?", 14, 0);
    if (part === 1 && low) askSpan(P, -10, H, yT, "L₀ = ?", 0);
    if (part === 2 && low) askLabel(P, 0, b.y, "ΣF = ?", 14, -10);
    if (part === 3) askLabel(P, 0, 40, "ΣF = 0: h = ?", 30, 0);
    if (part === 4 && t >= mm.events.slack - 1e-9) askLabel(P, 0, b.y, "t = ?", 14, 0);
  },
};
