import { body, type State } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1991 q1: M1 = 3 kg and M2 = 2 kg on a smooth board tilted 30°, tied over a pulley P at the top; released from rest
 * at the same distance from the bottom edge AD (drawn: 3 m). After 1 s the string breaks. The board is drawn from above:
 * up the board is up the page; positions are distances from AD along the board.
 */
const g = 10, m1 = 3, m2 = 2, gs = g * Math.sin(Math.PI / 6), d = 3, X1 = -0.7, X2 = 0.7;
// time to reach AD from height s along the board, moving with velocity v (up positive), accelerating gs down
const toAD = (s: number, v: number) => (v + Math.sqrt(v * v + 2 * gs * s)) / gs;
// build 2: before the break, the string tension from both bodies' equations; after it, only the weight along the board
const tied = (): Record<string, [number, number]> => {
  const T = (2 * m1 * m2 * gs) / (m1 + m2);
  return { a: [0, (T - m1 * gs) / m1], b: [0, (T - m2 * gs) / m2] };
};
export const spec = storySpec({
  id: "bagrut-1991-q1",
  view: { x0: -2.6, x1: 2.6, y0: -0.4, y1: 5.2 },
  scale: 5,
  story: {
    init: { a: body(X1, d, 0, 0), b: body(X2, d, 0, 0) },
    phases: [
      { end: "break", acc: { a: [0, -((m1 - m2) * gs) / (m1 + m2)], b: [0, ((m1 - m2) * gs) / (m1 + m2)] }, dur: () => 1, force: tied, until: (_s, t) => t >= 1 - 1e-12 },
      { end: "top2", acc: { a: [0, -gs], b: [0, -gs] }, dur: (s) => s.b.vy / gs, force: () => ({ a: [0, -gs], b: [0, -gs] }), until: (s) => s.b.vy <= 0 },
      { end: "bottom1", acc: { a: [0, -gs], b: [0, -gs] }, dur: (s: State) => toAD(s.a.y, s.a.vy), force: () => ({ a: [0, -gs], b: [0, -gs] }), until: (s) => s.a.y <= 0, jump: (s) => { s.a.vy = 0; } },
      { end: "bottom2", acc: { b: [0, -gs] }, dur: (s: State) => toAD(s.b.y, s.b.vy), force: () => ({ b: [0, -gs] }), until: (s) => s.b.y <= 0, jump: (s) => { s.b.vy = 0; } },
    ],
    record: { aUp: ["break", (s) => s.b.vy / 1], T: ["break", (s) => m2 * (s.b.vy / 1 + gs)] },
  },
  order: ["break", "top2", "bottom1", "bottom2"],
  answers: { aUp: [1, 1e-9], T: [12, 1e-9] },
  parts: [
    { to: (m) => m.events.break, pace: 1.6, caption: "משחררים את שני הגופים ממנוחה. מה התאוצה של הגוף M2?" },
    { to: (m) => m.events.break, pace: 1.6, caption: "מה המתיחות בחוט שמחבר את הגופים?" },
    { from: (m) => m.events.break, to: (m) => m.events.bottom2, pace: 1.6, caption: "אחרי שנייה החוט נקרע. איך נע כל אחד מהגופים מעכשיו: לאיזה כיוון, ואיזו תנועה?" },
    { to: (m) => m.events.bottom2, pace: 1.6, caption: "איזה גוף מגיע לצלע AD מהר יותר?" },
  ],
  draw: (P, m, t, part) => {
    // the board seen from above, the pulley at the top
    P.poly([[-2.2, 0], [2.2, 0], [2.2, 4.8], [-2.2, 4.8]]);
    P.mono(-2.2, 0, "A", { tone: "data", size: 13, dxPx: -10, dyPx: 12 });
    P.mono(2.2, 0, "D", { tone: "data", size: 13, dxPx: 10, dyPx: 12 });
    P.mono(-2.2, 4.8, "B", { tone: "data", size: 13, dxPx: -10 });
    P.mono(2.2, 4.8, "C", { tone: "data", size: 13, dxPx: 10 });
    P.heb(0, 5.05, "מעלה הלוח", { tone: "data", size: 11 });
    P.pulley(0, 4.4, 30);
    P.mono(0, 4.4, "P", { tone: "data", size: 12, dyPx: -36 });
    const s = m.state(t), broken = t >= m.events.break - 1e-9;
    for (const [b, x] of [[s.a, X1], [s.b, X2]] as const) {
      if (!broken) P.line(x, b.y + 0.25, x, 4.4, { tone: "line", w: 1.4 });
      else P.line(x, 4.4, x, 4.0, { tone: "line", w: 1.4 });
    }
    P.block(X1, s.a.y, { wPx: 36, hPx: 30, base: false, label: "M1" });
    P.block(X2, s.b.y, { wPx: 30, hPx: 26, base: false, label: "M2", tone: "b2" });
    for (const [b, x] of [[s.a, X1], [s.b, X2]] as const) if (Math.abs(b.vy) > 0.05) P.arrowPx(x + (x < 0 ? -0.55 : 0.55), b.y, 0, -b.vy * 12, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, X2, s.b.y, "a = ?", 30, -10);
    if (part === 1 && !broken) askLabel(P, 0, 3.6, "T = ?", 0, 0);
    if (part === 3 && t >= m.events.bottom2 - 1e-9) askLabel(P, 0, 0.3, "v₁ ? v₂", 0, -10);
  },
});
