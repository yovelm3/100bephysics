import { arc, askLabel, trackMotion } from "../kits";

/** 1990 q3: 0.3 kg on a 0.8 m string, a vertical circle, 9 m/s at the bottom A; C and D at the ends of the horizontal diameter, B at the top. */
const R = 0.8;
export const spec = trackMotion({
  id: "bagrut-1990-q3",
  path: arc(0, 0, R, 0, (3 * Math.PI) / 2, 600),
  v0: 9,
  points: { C: 200, B: 400 },
  view: { x0: -1.6, x1: 1.6, y0: -1.0, y1: 1.0 },
  bare: true,
  answers: { "v@C": [Math.sqrt(65), 1e-3], "v@B": [7, 1e-3] },
  parts: [
    { to: (m) => m.events.C, pace: 4, caption: "הגוף נע במעגל אנכי, ב-A מהירותו 9 m/s. אילו כוחות פועלים עליו בנקודה C, ומה המתיחות?" },
    { to: (m) => m.events.B, pace: 4, caption: "אילו כוחות פועלים בנקודה B, ומה התאוצה שם, בגודל ובכיוון?" },
    { to: (m) => m.events.end, pace: 4, caption: "בנקודה D החוט נקרע. איך ייראה המסלול של הגוף עד הקרקע?" },
  ],
  extra: (P, m, t, part) => {
    P.ring(0, 0, R, { tone: "idle", w: 1, dash: "4 4" });
    P.circle(0, 0, 3, { fill: "line" }); P.mono(0, 0, "O", { tone: "data", size: 11, dxPx: -10 });
    for (const [lab, x, y] of [["A", 0, -R], ["C", R, 0], ["B", 0, R], ["D", -R, 0]] as const) P.mono(x * 1.18, y * 1.18, lab, { tone: "data", size: 12, dyPx: 4 });
    const b = m.state(t).b;
    P.line(0, 0, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 7, { fill: "body" });
    P.arrowPx(b.x, b.y, b.vx * 5, -b.vy * 5, { tone: "vel", label: "v" });
    if (part === 0 && t >= m.events.C - 1e-9) askLabel(P, R / 2, 0, "T = ?", 0, -12);
    if (part === 1 && t >= m.events.B - 1e-9) askLabel(P, 0, R, "a = ?", 20, -14);
    if (part === 2 && t >= m.events.end - 1e-9) askLabel(P, -R, 0, "?", -30, 20);
  },
});
