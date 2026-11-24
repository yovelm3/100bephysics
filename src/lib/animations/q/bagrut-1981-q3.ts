import { arc, askLabel, trackMotion } from "../kits";

/** 1981 q3: a simple pendulum, 100 g on 1 m, let go at 5°. Build 1: energy along the arc; build 2: the weight's part along it, step by step. */
const l = 1, a0 = (5 * Math.PI) / 180;
export const spec = trackMotion({
  id: "bagrut-1981-q3",
  path: arc(0, 0, l, -a0, 0.99 * a0, 600),
  points: { low: 300 },
  dt: 1e-5,
  view: { x0: -0.6, x1: 0.6, y0: -1.1, y1: 0.1 },
  bare: true,
  answers: { "v@low": [0.2758732284312653, 1e-4] },
  parts: [
    { to: (m) => m.events.end, pace: 2, caption: "הראו שהתנועה של המטוטלת הרמונית בזווית קטנה, ומצאו את זמן המחזור." },
    { to: (m) => m.events.low, pace: 2, hideClock: true, caption: "m = 100 g, ℓ = 1 m, θ = 5°. כמה זמן עובר מהשחרור עד שהמסה עוברת בנקודה הנמוכה?" },
    { to: (m) => m.events.low, pace: 2, caption: "מה גודל המהירות הגדולה ביותר?" },
    { to: (m) => m.events.low, pace: 2, caption: "מה מתיחות החוט כשהמהירות הגדולה ביותר?" },
    { to: (m) => m.events.end, pace: 2, hideClock: true, caption: "בגובה רדיוס כדור הארץ מעל פני הקרקע: מה זמן המחזור של המטוטלת?" },
  ],
  extra: (P, m, t, part) => {
    P.line(-0.15, 0, 0.15, 0, { tone: "line", w: 3 });
    P.line(0, 0, 0, -l, { tone: "idle", w: 1, dash: "3 3" });
    const b = m.state(t).b;
    P.line(0, 0, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 7, { fill: "body" });
    const low = t >= m.events.low - 1e-9;
    const asks = ["T = ?", "t = ?", "v max = ?", "T = ?", "T = ?"];
    if (part === 0 || part === 4) askLabel(P, 0.25, -0.4, asks[part], 0, 0);
    else if (low) askLabel(P, b.x, b.y, asks[part], 16, 20);
  },
});
