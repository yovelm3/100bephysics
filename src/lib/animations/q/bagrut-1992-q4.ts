import { askLabel, spinMotion } from "../kits";

/**
 * 1992 q4: a turning table; a cart on a rail along its radius, tied to the center by a spring (K = 60 N/m, ℓ = 25 cm),
 * m = 2.4 kg. r = Kℓ/(K − 4π²f²m). Drawn at f = 0.5 Hz (r ≈ 0.41 m), seen from above. The table's radius is 1.25 m.
 */
const K = 60, l = 0.25, m = 2.4, f = 0.5;
const r = (K * l) / (K - 4 * Math.PI ** 2 * f * f * m);
export const spec = spinMotion({
  id: "bagrut-1992-q4",
  r,
  period: 1 / f,
  laps: 2,
  answers: { a: [(K * (r - l)) / m, 1e-6] },
  view: { x0: -2, x1: 2, y0: -1.4, y1: 1.4 },
  parts: [
    { to: (mm) => mm.events.lap2, pace: 1, caption: "השולחן מסתובב, והעגלה מסתובבת איתו במרחק r מהמרכז. מה r לפי נתוני השאלה?" },
    { to: (mm) => mm.events.lap2, pace: 1, caption: "האם לביטוי יש משמעות בכל תדירות סיבוב?" },
    { to: (mm) => mm.events.lap2, pace: 1, caption: "קוטר השולחן 2.5 m. באיזו תדירות העגלה תגיע לשפת השולחן?" },
  ],
  draw: (P, c, _m, _t, part) => {
    P.ring(0, 0, 1.25, { tone: "line", w: 2 });
    const u = { x: c.x / r, z: c.z / r };
    // the rail along the radius turns with the table
    P.line(0, 0, 1.25 * u.x, 1.25 * u.z, { tone: "soft", w: 6 });
    P.spring(0, 0, c.x, c.z, { coils: 8, ampPx: 5 });
    P.circle(c.x, c.z, 9, { fill: "body" });
    P.circle(0, 0, 4, { fill: "line" });
    P.arrowPx(c.x, c.z, c.vx * 16, -c.vz * 16, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, c.x / 2, c.z / 2, "r = ?", 0, -14);
    if (part === 1) askLabel(P, 0, 1.25, "f ?", 0, -10);
    if (part === 2) askLabel(P, 1.25 * u.x, 1.25 * u.z, "f = ?", 10, -10);
  },
});
