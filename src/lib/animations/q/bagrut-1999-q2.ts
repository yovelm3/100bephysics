import { body } from "../engine";
import { askSpan, askLabel, storySpec } from "../kits";

/**
 * 1999 q2: A (3 kg) and B (2 kg) over a pulley, held at rest 3.5 m above the floor until t = 2 s; from 2 s to 4 s a
 * person pushes B down with 15 N; at 4 s the person lets go. B comes closest to the floor 0.5 m above it.
 */
const g = 10, mA = 3, mB = 2, P0 = 15, H = 3.5;
// build 2: each body with the string tension T (A up positive: T − mA·g = mA·aA; B: T − mB·g − push = mB·aB; aB = −aA)
const tied = (push: number): Record<string, [number, number]> => {
  const T = (mA * (mB * g + push) + mA * mB * g) / (mA + mB);
  return { A: [0, (T - mA * g) / mA], B: [0, (T - mB * g - push) / mB] };
};
const a1 = (mB * g + P0 - mA * g) / (mA + mB), a2 = (mA * g - mB * g) / (mA + mB);
export const spec = storySpec({
  id: "bagrut-1999-q2",
  view: { x0: -6, x1: 6, y0: -0.4, y1: 8.4 },
  scale: 8,
  story: {
    init: { A: body(-0.5, H, 0, 0), B: body(0.5, H, 0, 0) },
    phases: [
      { end: "push", acc: {}, dur: () => 2, force: () => ({}), until: (_s, t) => t >= 2 - 1e-12 },
      { end: "letGo", acc: { A: [0, a1], B: [0, -a1] }, dur: () => 2, force: () => tied(P0), until: (_s, t) => t >= 4 - 1e-12 },
      { end: "lowest", acc: { A: [0, -a2], B: [0, a2] }, dur: (s) => -s.B.vy / a2, force: () => tied(0), until: (s) => s.B.vy >= 0 },
      { end: "Afloor", acc: { A: [0, -a2], B: [0, a2] }, dur: (s) => Math.sqrt((2 * s.A.y) / a2), force: () => tied(0), until: (s) => s.A.y <= 0, jump: (s) => { s.A.vy = 0; s.B.vy = 0; } },
    ],
    record: { aPush: ["letGo", (s) => -s.B.vy / 2], aFree: ["lowest", (s) => 0 * s.B.y + a2], yMin: ["lowest", (s) => s.B.y] },
  },
  order: ["push", "letGo", "lowest", "Afloor"],
  answers: { aPush: [1, 1e-9], yMin: [0.5, 1e-9] },
  parts: [
    { to: () => 2, pace: 1, caption: "האדם מחזיק את B, ושני הגופים במנוחה. מה המתיחות בחוט?" },
    { from: () => 2, to: () => 4, pace: 1, caption: "האדם מפעיל על B כוח של 15 N כלפי מטה. מה התאוצה ומה המתיחות בחוט?" },
    { from: () => 4, to: (m) => m.events.lowest, pace: 1, caption: "ברגע t = 4 s האדם עוזב את B. מה התאוצה עכשיו?" },
    { to: (m) => m.events.lowest, pace: 1, caption: "מה המרחק הקטן ביותר בין B לרצפה?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -5.5, 5.5);
    P.line(-2, 8.3, 2, 8.3, { tone: "line", w: 3 });
    P.line(0, 8.3, 0, 8.1, { tone: "line", w: 1.4 });
    P.pulley(0, 7.85, 18);
    const s = m.state(t);
    P.line(-0.5, 7.85, -0.5, s.A.y + 0.45, { tone: "line", w: 1.4 });
    P.line(0.5, 7.85, 0.5, s.B.y + 0.4, { tone: "line", w: 1.4 });
    P.block(-0.5, s.A.y, { wPx: 30, hPx: 32, label: "A" });
    P.block(0.5, s.B.y, { wPx: 26, hPx: 28, label: "B", tone: "b2" });
    if (t < 2) P.line(0.25, s.B.y - 0.05, 0.75, s.B.y - 0.05, { tone: "runner", w: 5 });
    else if (t < 4) P.arrowPx(0.5, s.B.y + 0.4, 0, 50, { tone: "runner", label: "15 N" });
    for (const [b, x] of [[s.A, -1.4], [s.B, 1.4]] as const) if (Math.abs(b.vy) > 0.05) P.arrowPx(x, b.y + 0.3, 0, -b.vy * 14, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, 0.5, 5.5, "T = ?", 14, 0);
    if (part === 1) askLabel(P, -0.5, s.A.y, "a = ?, T = ?", -150, -10);
    if (part === 2) askLabel(P, -0.5, s.A.y, "a = ?", -80, -10);
    if (part === 3 && t >= m.events.lowest - 1e-9) askSpan(P, 2.4, 0, s.B.y, "d = ?", 0);
  },
});
