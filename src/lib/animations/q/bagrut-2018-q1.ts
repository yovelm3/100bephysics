import { body, type State } from "../engine";
import { askLabel, askSpan, storySpec } from "../kits";

/** 2018 q1: three balls from a 100 m tower at the same moment: A down at 5 m/s, B up at 5 m/s, C from rest. The graph is B's (down positive). */
const g = 10, H = 100, v0 = 5;
const land = (k: string) => (s: State) => (s[k].vy + Math.sqrt(s[k].vy ** 2 + 2 * g * s[k].y)) / g;
const fall = (list: string[]) => Object.fromEntries(list.map((k) => [k, [0, -g] as [number, number]]));
export const spec = storySpec({
  id: "bagrut-2018-q1",
  view: { x0: -150, x1: 60, y0: -6, y1: 112 },
  scale: H,
  story: {
    init: { a: body(-8, H, 0, -v0), b: body(0, H, 0, v0), c: body(8, H, 0, 0) },
    phases: [
      { end: "topB", acc: fall(["a", "b", "c"]), dur: (s) => s.b.vy / g, force: () => fall(["a", "b", "c"]), until: (s) => s.b.vy <= 0 },
      { end: "landA", acc: fall(["a", "b", "c"]), dur: land("a"), force: () => fall(["a", "b", "c"]), until: (s) => s.a.y <= 0, jump: (s) => { s.a.vy = 0; } },
      { end: "landC", acc: fall(["b", "c"]), dur: land("c"), force: () => fall(["b", "c"]), until: (s) => s.c.y <= 0, jump: (s) => { s.c.vy = 0; } },
      { end: "landB", acc: fall(["b"]), dur: land("b"), force: () => fall(["b"]), until: (s) => s.b.y <= 0, jump: (s) => { s.b.vy = 0; } },
    ],
    marks: { t2: [() => 2, (_s, t) => t >= 2] },
  },
  order: ["topB", "t2", "landA", "landC", "landB"],
  answers: { landB: [5, 1e-9], landA: [4, 1e-9] },
  parts: [
    { to: (m) => m.events.landB, pace: 0.8, caption: "הגרף מתאר את המהירות של אחד הכדורים (הכיוון החיובי כלפי מטה). של איזה כדור?" },
    { to: (m) => m.events.landB, pace: 0.8, caption: "לפי הגרף: מה גובה המגדל?" },
    { to: () => 2, pace: 0.8, caption: "מה המרחק האנכי בין כדור A לכדור B ברגע t = 2 s?" },
    { to: (m) => m.events.landB, pace: 0.8, caption: "מוסיפים את הגרפים של שני הכדורים האחרים. מה המשמעות של כל אחד מהערכים המסומנים?" },
    { to: (m) => m.events.landB, pace: 0.8, caption: "עכשיו פועל על כל כדור חיכוך קבוע עם האוויר. האם כדור A פוגע בקרקע מהר יותר מכדור B?" },
  ],
  draw: (P, m, t, part) => {
    // the question's graph: B's velocity, down positive
    const G = P.graph({ xPx: 60, yPx: 40, wPx: 300, hPx: 240, tMax: 5.5, vMin: -10, vMax: 50, xLabel: "t (s)", yLabel: "v (m/s)" });
    P.path([[G.gx(0), G.gy(-5)], [G.gx(5), G.gy(45)]], { tone: "body", w: 2.4 });
    for (const tt of [1, 2, 3, 4, 5]) P.textPx(G.gx(tt), G.gy(0) + 13, String(tt), { tone: "data", size: 10 });
    for (const vv of [-10, 10, 20, 30, 40, 50]) P.textPx(56, G.gy(vv) + 4, String(vv), { tone: "data", size: 10, anchor: "end" });
    if (part === 0) askLabel(P, -100, 80, "A? B? C?", 0, 0);
    // the tower and the balls
    P.ground(0, -20, 55);
    P.poly([[16, 0], [40, 0], [40, H], [16, H]]);
    const s = m.state(t);
    const lab = [["a", "A", "body"], ["b", "B", "b2"], ["c", "C", "runner"]] as const;
    for (const [k, L, tone] of lab) {
      const q = s[k];
      P.ball(q.x, q.y, { rPx: 6, tone, label: L });
      if (Math.abs(q.vy) > 0.3) P.arrowPx(q.x, q.y + 2, 0, -q.vy * 1.4, { tone: "vel" });
      if (part === 4 && Math.abs(q.vy) > 0.3) P.arrowPx(q.x + 3, q.y + 2, 0, Math.sign(q.vy) * 18, { tone: "ask" });
    }
    if (part === 1) askSpan(P, 46, 0, H, "H = ?", 8);
    if (part === 2 && t >= 2 - 1e-9) askSpan(P, -16, s.a.y, s.b.y, "Δy = ?", -14);
    if (part === 3) askLabel(P, -100, 80, "(1) (2) (3) ?", 0, 0);
    if (part === 4 && t >= m.events.landB - 1e-9) askLabel(P, 0, 0, "vA ? vB", 0, -40);
  },
});
