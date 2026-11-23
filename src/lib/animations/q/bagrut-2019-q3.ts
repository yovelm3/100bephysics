import { askLabel, spinMotion } from "../kits";

/** 2019 q3: a rotor: a cylinder of r = 3 m; a 70 kg person stays against the wall (μs = 0.6) after the floor drops. Drawn at ω = 2.6 s⁻¹, seen from above. */
const r = 3, w = 2.6;
export const spec = spinMotion({
  id: "bagrut-2019-q3",
  r,
  period: (2 * Math.PI) / w,
  laps: 2,
  answers: { a: [w * w * r, 1e-6] },
  view: { x0: -5.5, x1: 5.5, y0: -3.8, y1: 3.8 },
  parts: [
    { to: (m) => m.events.lap2, pace: 1, caption: "הרצפה הורדה, והאדם צמוד לדופן. אילו כוחות פועלים עליו?" },
    { to: (m) => m.events.lap2, pace: 1, caption: "מה משוואות הכוחות: בכיוון האנכי ובכיוון הרדיאלי?" },
    { to: (m) => m.events.lap2, pace: 1, caption: "מה המהירות הזוויתית הקטנה ביותר שבה האדם לא מחליק למטה?" },
    { to: (m) => m.events.lap2, pace: 1, caption: "האם התשובה משתנה אם המסה של האדם 90 ק\"ג?" },
    { to: (m) => m.events.lap2, pace: 1, caption: "ω = 2.6 s⁻¹, והאדם לא זז ביחס לדופן. מה כוח החיכוך הסטטי עליו?" },
  ],
  draw: (P, c, _m, _t, part) => {
    P.ring(0, 0, r + 0.15, { tone: "line", w: 5 });
    P.circle(0, 0, 3, { fill: "line" });
    P.circle(c.x * 0.95, c.z * 0.95, 9, { fill: "runner" });
    P.arrowPx(c.x * 0.95, c.z * 0.95, c.vx * 6, -c.vz * 6, { tone: "vel", label: "v" });
    const p: [number, number] = [c.x * 0.95, c.z * 0.95];
    if (part === 0) askLabel(P, p[0], p[1], "?", 14, -16);
    if (part === 1) askLabel(P, p[0], p[1], "ΣF ?", 14, -16);
    if (part === 2) askLabel(P, 0, 0, "ω min = ?", 0, -20);
    if (part === 3) askLabel(P, p[0], p[1], "m = 90 kg ?", 14, -16);
    if (part === 4) askLabel(P, p[0], p[1], "f = ?", 14, -16);
  },
});
