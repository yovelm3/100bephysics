import { arc, askLabel, trackMotion } from "../kits";

/** 1993 q4: released from rest at A, down a quarter circle (R, center O) to B, then around a loop (r, center O′); drawn R = 3 m, r = 1 m. */
const R = 3, r = 1;
const path = [...arc(0, R, R, -Math.PI / 2, 0, 300), ...arc(0, r, r, 0, (3 * Math.PI) / 2, 600).slice(1)];
export const spec = trackMotion({
  id: "bagrut-1993-q4",
  path,
  points: { B: 300, C: 500, D: 700 },
  view: { x0: -3.6, x1: 2.6, y0: -0.3, y1: 3.4 },
  bare: true,
  answers: { "v@C": [Math.sqrt(2 * 10 * (R - r)), 1e-3] },
  parts: [
    { to: (m) => m.events.C, pace: 1.5, caption: "הגוף משוחרר ממנוחה ב-A. מה המהירות שלו בנקודה C, ומה הכיוון שלה?" },
    { to: (m) => m.events.C, pace: 1.5, caption: "מה התאוצה הרדיאלית בנקודה C?" },
    { to: (m) => m.events.C, pace: 1.5, caption: "מה התאוצה המשיקית בנקודה C?" },
    { to: (m) => m.events.end, pace: 1.5, caption: "מה היחס הקטן ביותר R/r, כדי שהגוף לא ייפרד מהמסילה המעגלית?" },
    { to: (m) => m.events.B, pace: 1.5, caption: "למה הכוח השקול על הגוף בין A ל-B לא משיק למסילה?" },
  ],
  extra: (P, m, t, part) => {
    P.poly(arc(0, R, R, -Math.PI / 2, 0, 80), { close: false, fill: "none", tone: "line", w: 2.4 });
    P.ring(0, r, r, { tone: "line", w: 2.4 });
    P.circle(0, R, 3, { fill: "data" }); P.mono(0, R, "O", { tone: "data", size: 11, dxPx: 10 });
    P.circle(0, r, 3, { fill: "data" }); P.mono(0, r, "O′", { tone: "data", size: 11, dxPx: 12 });
    for (const [lab, x, y] of [["A", -R, R], ["B", 0, 0], ["C", r, r], ["D", 0, 2 * r], ["E", -r, r]] as const) P.mono(x, y, lab, { tone: "data", size: 12, dxPx: x > 0 ? 12 : x < 0 ? -12 : 0, dyPx: y === 0 ? 16 : -8 });
    const b = m.state(t).b;
    P.circle(b.x, b.y, 7, { fill: "body" });
    if (Math.hypot(b.vx, b.vy) > 0.05) P.arrowPx(b.x, b.y, b.vx * 7, -b.vy * 7, { tone: "vel", label: "v" });
    const atC = t >= m.events.C - 1e-9;
    if (part === 0 && atC) askLabel(P, r, r, "v = ?", 14, 30);
    if (part === 1 && atC) askLabel(P, r, r, "aR = ?", 14, 30);
    if (part === 2 && atC) askLabel(P, r, r, "aT = ?", 14, 30);
    if (part === 3) askLabel(P, 0, 2 * r, "R / r ≥ ?", 0, -20);
    if (part === 4) askLabel(P, b.x, b.y, "ΣF ?", 14, -20);
  },
});
