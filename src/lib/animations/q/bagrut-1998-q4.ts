import { arc, askLabel, trackMotion } from "../kits";

/** 1998 q4: simple pendulums of different lengths at a small angle; the one drawn: 1.0 m (period 2.0 s), let go at 8°. */
const l = 1, a0 = (8 * Math.PI) / 180;
export const spec = trackMotion({
  id: "bagrut-1998-q4",
  path: arc(0, 0, l, -a0, 0.99 * a0, 600),
  points: { low: 300 },
  dt: 1e-5,
  view: { x0: -0.6, x1: 0.6, y0: -1.1, y1: 0.1 },
  bare: true,
  parts: [
    { to: (m) => m.events.end, pace: 2, hideClock: true, caption: "איזה גרף מתאים לחשב ממנו את תאוצת הנפילה החופשית, לפי אורכי המטוטלות וזמני המחזור?" },
    { to: (m) => m.events.end, pace: 2, hideClock: true, caption: "לפי הגרף: מה תאוצת הנפילה החופשית?" },
    { to: (m) => m.events.end, pace: 2, hideClock: true, caption: "ℓ = 1.0 m, T = 2.0 s. התלמיד מדד את הגובה של המשקולת. כל כמה זמן הגובה חוזר על עצמו?" },
  ],
  extra: (P, m, t, part) => {
    P.line(-0.15, 0, 0.15, 0, { tone: "line", w: 3 });
    const b = m.state(t).b;
    P.line(0, 0, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 7, { fill: "body" });
    askLabel(P, 0.3, -0.4, ["g(T, ℓ) ?", "g = ?", "Δt = ?"][part], 0, 0);
  },
});
