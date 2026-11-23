import { arc, askLabel, trackMotion } from "../kits";

/** 2001 q4: a giant swing: released at A (46 m high) on an arc of radius 50 m whose lowest point B is 1 m above the ground. */
const R = 50, yB = 1, yA = 46;
const th = Math.acos((yB + R - yA) / R);
export const spec = trackMotion({
  id: "bagrut-2001-q4",
  path: arc(0, yB + R, R, -th, 0.99 * th, 800),
  points: { M: 200, B: 400 },
  view: { x0: -62, x1: 62, y0: -4, y1: 58 },
  bare: true,
  answers: { "v@B": [30, 1e-3] },
  parts: [
    { to: (m) => m.events.B, pace: 0.5, caption: "משחררים את הנערים מ-A, בגובה 46 m. מה גודל המהירות שלהם ב-B?" },
    { to: (m) => m.events.B, pace: 0.5, caption: "מה התאוצה הצנטריפטלית ב-B?" },
    { to: (m) => m.events.B, pace: 0.5, caption: "מה הכוח השקול שהחוטים מפעילים על שלושת הנערים ב-B?" },
    { to: (m) => m.events.M, pace: 0.5, caption: "בנקודה M, בין A ל-B: איזה כיוון יכול לתאר את התאוצה?" },
  ],
  extra: (P, m, t, part) => {
    P.ground(0, -60, 60);
    P.poly(arc(0, yB + R, R, -th, th, 100), { close: false, fill: "none", tone: "idle", w: 1, dash: "4 4" });
    const A: [number, number] = [-R * Math.sin(th), yA];
    P.poly([[A[0] - 4, 0], [A[0] + 1, 0], [A[0] + 1, yA - 1], [A[0] - 4, yA - 1]]);
    P.mono(A[0], yA, "A", { tone: "data", size: 12, dyPx: -10, dxPx: -10 });
    P.mono(0, yB, "B", { tone: "data", size: 12, dyPx: 16 });
    const b = m.state(t).b;
    P.line(0, yB + R, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 8, { fill: "body" });
    if (Math.hypot(b.vx, b.vy) > 0.2) P.arrowPx(b.x, b.y, b.vx * 1.5, -b.vy * 1.5, { tone: "vel", label: "v" });
    if (part === 0 && t >= m.events.B - 1e-9) askLabel(P, 0, yB, "v = ?", 20, -24);
    if (part === 1 && t >= m.events.B - 1e-9) askLabel(P, 0, yB, "aR = ?", 20, -24);
    if (part === 2 && t >= m.events.B - 1e-9) askLabel(P, 0, yB + R / 2, "F = ?", 12, 0);
    if (part === 3 && t >= m.events.M - 1e-9) askLabel(P, b.x, b.y, "a ?", 16, -20);
  },
});
