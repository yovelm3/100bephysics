import { askLabel, collision } from "../kits";

/** 2002 q5: a 1.2 kg cart at 3 m/s hits a long spring (K = 30 N/m) and comes back (elastic): contact π·√(m/K) = 0.63 s, compression 0.6 m. */
export const spec = collision({
  id: "bagrut-2002-q5",
  a: { m: 1.2, x: 0, v: 3, w: 0.3 },
  b: { wall: 2.0 },
  kind: "elastic",
  k: 30,
  tEnd: 1.8,
  answers: { va: [-3, 1e-9], F: [18, 1e-6] },
  view: { x0: -0.4, x1: 3.6, y0: -0.4, y1: 1.6 },
  parts: [
    { to: (m) => m.events.end, pace: 1, hideClock: true, caption: "העגלה פוגעת בקפיץ וחוזרת. כמה זמן היא במגע עם הקפיץ?" },
    { to: (m) => (m.events.hit + m.events.sep) / 2, pace: 1, caption: "מה הכיווץ המרבי של הקפיץ?" },
    { to: (m) => m.events.end, pace: 1, caption: "האם העבודה של הקפיץ על העגלה, מתחילת ההתנגשות עד סופה, היא אפס?" },
    { to: (m) => m.events.end, pace: 1, caption: "האם המתקף שהקפיץ הפעיל על העגלה הוא אפס?" },
  ],
  draw: (P, m, t, part) => {
    P.line(-0.3, 0, 3.5, 0, { tone: "line", w: 2 });
    P.wall(3.5, 0, 0.6, "right");
    const a = m.state(t).a;
    const front = a.x + 0.15, springEnd = Math.min(2.0, front);
    P.spring(springEnd, 0.15, 3.5, 0.15, { coils: 12, ampPx: 7 });
    P.cart(a.x, 0, { wPx: 50 });
    P.arrowPx(a.x, 0.7, a.vx * 20, 0, { tone: "vel", label: "v" });
    const asks = ["Δt = ?", "Δx max = ?", "W = 0 ?", "J = 0 ?"];
    if (part === 1 && t >= (m.events.hit + m.events.sep) / 2 - 1e-9) askLabel(P, (springEnd + 2.0) / 2, 0.15, asks[1], 0, -30);
    else if (part !== 1) askLabel(P, 1.5, 1.3, asks[part], 0, 0);
  },
});
