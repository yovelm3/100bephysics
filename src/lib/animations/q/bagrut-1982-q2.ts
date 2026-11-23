import { body } from "../engine";
import { askLabel, askWidth, storySpec } from "../kits";

/**
 * 1982 q2: cart m = 6 kg on a smooth table, tied over a pulley at the right edge to M = 4 kg hanging.
 * F = 60 N pulls the cart left for 3 s, then stops. Build 1: a = (F − Mg)/(m + M) and then Mg/(m + M);
 * build 2: the same Newton's law written per body with the string tension, step by step.
 */
const m = 6, M = 4, F = 60, g = 10, tF = 3;
// build 2: each body separately; the string keeps them moving together, so solve for the tension T at every step
const accel = (f: number) => {
  // cart (x right): m·ax = T − f ; weight (y up): M·ay = T − Mg ; string: ay = −ax
  const T = (m * M * g + M * f) / (m + M);
  const ax = (T - f) / m;
  return { c: [ax, 0] as [number, number], w: [0, (T - M * g) / M] as [number, number] };
};
export const spec = storySpec({
  id: "bagrut-1982-q2",
  view: { x0: -17, x1: 9, y0: -9, y1: 4 },
  scale: 10,
  story: {
    init: { c: body(0, 0, 0, 0), w: body(5.4, -9.6, 0, 0) },
    phases: [
      { end: "Foff", acc: { c: [-(F - M * g) / (m + M), 0], w: [0, (F - M * g) / (m + M)] }, dur: () => tF, force: () => accel(F), until: (_s, t) => t >= tF - 1e-12 },
      { end: "stop", acc: { c: [(M * g) / (m + M), 0], w: [0, -(M * g) / (m + M)] }, dur: (s) => -s.c.vx / ((M * g) / (m + M)), force: () => accel(0), until: (s) => s.c.vx >= 0 },
      { end: "back", acc: { c: [(M * g) / (m + M), 0], w: [0, -(M * g) / (m + M)] }, dur: (s) => Math.sqrt((2 * (-9 - s.c.x)) / ((M * g) / (m + M))), force: () => accel(0), until: (s) => s.c.x >= -9 },
    ],
    record: { vF: ["Foff", (s) => -s.c.vx], xF: ["Foff", (s) => -s.c.x] },
  },
  order: ["Foff", "stop", "back"],
  answers: { vF: [6, 1e-9], xF: [9, 1e-9], back: [6, 1e-9] },
  parts: [
    { to: (m_) => m_.events.back, pace: 0.8, caption: "הכוח F מושך את הקרונית שמאלה 3 שניות ואז מפסיק. איך נעה הקרונית בזמן הזה ואחריו?" },
    { to: (m_) => m_.events.Foff, pace: 0.8, caption: "מה המהירות של הקרונית ברגע שהכוח מפסיק לפעול?" },
    { to: (m_) => m_.events.Foff, pace: 0.8, caption: "איזה מרחק עברה הקרונית בזמן שהכוח פעל?" },
    { from: (m_) => m_.events.Foff, to: (m_) => m_.events.back, pace: 0.8, hideClock: true, caption: "כעבור כמה זמן מהרגע שהכוח מפסיק, הקרונית חוזרת לאותו מקום?" },
  ],
  draw: (P, mm, t, part) => {
    const s = mm.state(t);
    // the table and the pulley at its right edge
    P.poly([[-16.5, 0], [5, 0], [5, -0.5], [-16.5, -0.5]]);
    P.pulley(5.2, 0.35, 9);
    const cx = s.c.x;
    P.line(cx + 0.6, 0.35, 5.2, 0.35, { tone: "line", w: 1.4 });
    // the hanging weight rises as much as the cart moves left (drawn at half scale, to fit)
    const wy = -1.6 - 0.45 * (13.5 + cx);
    P.line(5.42, 0.35, 5.42, wy + 0.45, { tone: "line", w: 1.4 });
    P.block(5.42, wy, { wPx: 22, hPx: 24, tone: "b2", label: "M", base: false });
    P.cart(cx, 0, { wPx: 42, label: "m" });
    if (t < mm.events.Foff) P.arrowPx(cx - 0.6, 0.35, -60, 0, { tone: "force", label: "F" });
    if (Math.abs(s.c.vx) > 0.05) P.arrowPx(cx, 1.4, s.c.vx * 9, 0, { tone: "vel", label: "v" });
    if (part === 1 && t >= mm.events.Foff - 1e-9) askLabel(P, cx, 1.4, "v = ?", -10, -40);
    if (part === 2 && t >= mm.events.Foff - 1e-9) askWidth(P, -9, 0, 0, "d = ?", 40);
    if (part === 3) { P.line(-9, 0, -9, -0.9, { tone: "data", w: 1.2, dash: "3 3" }); askLabel(P, -9, 0, "t = ?", 0, 40); }
  },
});
