import { arc, askLabel, trackMotion } from "../kits";

/** 2003 q3: a weight hangs at rest on a string ℓ; then it is pulled aside to α0 (drawn 50°, ℓ = 1 m) and let go. */
const l = 1, a0 = (50 * Math.PI) / 180;
export const spec = trackMotion({
  id: "bagrut-2003-q3",
  path: arc(0, 0, l, -a0, 0.99 * a0, 600),
  points: { low: 300 },
  dt: 2e-5,
  view: { x0: -1.4, x1: 1.4, y0: -1.15, y1: 0.25 },
  bare: true,
  answers: { "v@low": [Math.sqrt(2 * 10 * l * (1 - Math.cos(a0))), 1e-3] },
  parts: [
    { to: () => 0.01, pace: 1, caption: "המשקולת תלויה במנוחה. מי מפעיל את הכוח T, ומי את הכוח mg?" },
    { to: () => 0.01, pace: 1, caption: "האם T ו-mg הם זוג של פעולה ותגובה?" },
    { to: () => 0.15, pace: 2, caption: "התלמיד מסיט את המשקולת ל-α0 ועוזב. מה המתיחות ברגע השחרור?" },
    { to: (m) => m.events.low, pace: 2, caption: "מה המתיחות כשהמשקולת בנקודה הנמוכה ביותר?" },
  ],
  extra: (P, m, t, part) => {
    P.line(-0.3, 0, 0.3, 0, { tone: "line", w: 3 });
    const b = part < 2 ? { x: 0, y: -l, vx: 0, vy: 0 } : m.state(t).b;
    P.line(0, 0, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 8, { fill: "body" });
    if (part >= 2) { P.line(0, 0, 0, -l, { tone: "idle", w: 1, dash: "3 3" }); P.mono(-0.12, -0.3, "α0", { tone: "data", size: 11 }); }
    if (part < 2) { P.arrowPx(0, -l, 0, -40, { tone: "force", label: "T" }); P.arrowPx(0, -l, 0, 40, { tone: "force", label: "mg" }); askLabel(P, 0, -l, "?", 30, 0); }
    if (part === 2) askLabel(P, b.x, b.y, "T = ?", -50, 10);
    if (part === 3 && t >= m.events.low - 1e-9) askLabel(P, 0, -l / 2, "T = ?", 12, 0);
  },
});
