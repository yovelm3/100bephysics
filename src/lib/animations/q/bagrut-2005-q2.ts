import { arc, askLabel, trackMotion } from "../kits";

/** 2005 q2: 100 g on a 1 m string swings between A and C; the largest angle is 60°; B is the lowest point. */
const l = 1, a0 = Math.PI / 3;
export const spec = trackMotion({
  id: "bagrut-2005-q2",
  path: arc(0, 0, l, -a0, 0.99 * a0, 600),
  points: { at30: 150, B: 300 },
  dt: 2e-5,
  view: { x0: -1.4, x1: 1.4, y0: -1.15, y1: 0.25 },
  bare: true,
  answers: { "v@B": [Math.sqrt(10), 1e-3] },
  parts: [
    { to: (m) => m.events.B, pace: 2, caption: "מה גודל המהירות של המשקולת ב-B, הנקודה הנמוכה ביותר?" },
    { to: (m) => m.events.end, pace: 2, caption: "איזה רכיב של הכוח השקול משנה את גודל המהירות, ואיזה את הכיוון שלה?" },
    { to: () => 0.02, pace: 2, caption: "המשקולת נעה ימינה, מ-A ל-C. מה כיוון התאוצה בנקודה A?" },
    { to: (m) => m.events.B, pace: 2, caption: "מה כיוון התאוצה בנקודה B?" },
    { to: () => 0.02, pace: 2, caption: "מה גודל התאוצה בנקודה A?" },
    { to: (m) => m.events.B, pace: 2, caption: "מה גודל התאוצה בנקודה B?" },
    { to: (m) => m.events.at30, pace: 2, caption: "מה המתיחות בחוט כשהוא נטוי ב-30° מהאנך?" },
    { to: (m) => m.events.B, pace: 2, caption: "מה העבודה של המתיחות בחוט מ-A ל-B?" },
  ],
  extra: (P, m, t, part) => {
    P.line(-0.3, 0, 0.3, 0, { tone: "line", w: 3 });
    P.poly(arc(0, 0, l, -a0, a0, 80), { close: false, fill: "none", tone: "idle", w: 1, dash: "4 4" });
    for (const [lab, a] of [["A", -a0], ["B", 0], ["C", a0]] as const) P.mono(l * Math.sin(a) * 1.1, -l * Math.cos(a) * 1.1, lab, { tone: "data", size: 12 });
    const b = m.state(t).b;
    P.line(0, 0, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 8, { fill: "body" });
    if (Math.hypot(b.vx, b.vy) > 0.05) P.arrowPx(b.x, b.y, b.vx * 14, -b.vy * 14, { tone: "vel", label: "v" });
    const end = (k: string) => t >= m.events[k] - 1e-9;
    if (part === 0 && end("B")) askLabel(P, 0, -l, "v = ?", 20, 20);
    if (part === 1) askLabel(P, b.x, b.y, "aR, aT ?", 16, 20);
    if (part === 2 || part === 4) askLabel(P, b.x, b.y, part === 2 ? "a ?" : "|a| = ?", -60, 0);
    if ((part === 3 || part === 5) && end("B")) askLabel(P, 0, -l, part === 3 ? "a ?" : "|a| = ?", 20, 20);
    if (part === 6 && end("at30")) askLabel(P, b.x / 2, b.y / 2, "T = ?", -50, 0);
    if (part === 7 && end("B")) askLabel(P, -0.3, -0.5, "W(T) = ?", -30, 0);
  },
});
