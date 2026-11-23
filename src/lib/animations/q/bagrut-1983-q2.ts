import { askLabel, spinMotion } from "../kits";

/**
 * 1983 q2: a carousel: arms of b = 1.4 m on a pole, ropes of 2.0 m, chairs. The chairs are 3.0 m from the axis when the
 * rope makes α with the vertical where sin α = 1.6/2 (tan α = 4/3), so ω² = g·tan α / r. Seen from the side, a little
 * from above (the circle looks like an ellipse).
 */
const g = 10, b = 1.4, l = 2, r = 3;
const al = Math.asin((r - b) / l);
const w = Math.sqrt((g * Math.tan(al)) / r);
const H = 5.2, tilt = 0.3;
export const spec = spinMotion({
  id: "bagrut-1983-q2",
  r,
  period: (2 * Math.PI) / w,
  laps: 2,
  answers: { v: [w * r, 1e-6] },
  view: { x0: -5, x1: 5, y0: -0.2, y1: 6.3 },
  parts: [
    { to: (m) => m.events.lap2, pace: 1, caption: "באיזו תדירות צריך לסובב את הסחרחרה, כדי שהכיסאות יתרחקו 3 m מהעמוד?" },
    { to: (m) => m.events.lap2, pace: 1, caption: "בכיסא יושב נער של 55 ק\"ג. מה המתיחות בחבל?" },
    { to: (m) => m.events.lap1 * 0.75, pace: 1, caption: "הנער עוזב כדור, והוא פוגע בקרקע אחרי 0.5 s. באיזה מרחק מהעמוד?" },
  ],
  draw: (P, c, m, t, part) => {
    const scr = (x: number, z: number, y: number): [number, number] => [x, y + tilt * z];
    P.ground(0, -4.8, 4.8);
    P.line(0, 0, 0, H, { tone: "line", w: 4 });
    // the chairs' circle (pale) and the arm tips' circle
    P.poly(Array.from({ length: 61 }, (_, i) => { const a = (2 * Math.PI * i) / 60; return scr(r * Math.cos(a), r * Math.sin(a), H - l * Math.cos(al)); }), { close: false, fill: "none", tone: "idle", w: 1, dash: "4 4" });
    const u = { x: c.x / r, z: c.z / r };
    const tip = scr(b * u.x, b * u.z, H), chair = scr(c.x, c.z, H - l * Math.cos(al));
    P.line(0, H, tip[0], tip[1], { tone: "line", w: 3 });
    P.line(tip[0], tip[1], chair[0], chair[1], { tone: "line", w: 1.6 });
    P.block(chair[0], chair[1], { wPx: 22, hPx: 16, base: false });
    // the opposite arm, for the look of the carousel
    const tip2 = scr(-b * u.x, -b * u.z, H), ch2 = scr(-c.x, -c.z, H - l * Math.cos(al));
    P.line(0, H, tip2[0], tip2[1], { tone: "line", w: 3 }); P.line(tip2[0], tip2[1], ch2[0], ch2[1], { tone: "line", w: 1.6 }); P.block(ch2[0], ch2[1], { wPx: 22, hPx: 16, base: false, tone: "idle" });
    P.arrowPx(chair[0], chair[1], c.vx * 6, -tilt * c.vz * 6, { tone: "vel", label: "v" });
    void m; void t;
    if (part === 0) askLabel(P, 0, H, "f = ?", 20, -20);
    if (part === 1) askLabel(P, (tip[0] + chair[0]) / 2, (tip[1] + chair[1]) / 2, "T = ?", 16, 0);
    if (part === 2) askLabel(P, chair[0], 0, "d = ?", 10, 20);
  },
});
