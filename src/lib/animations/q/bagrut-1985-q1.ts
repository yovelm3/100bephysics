import { askLabel, graphMotion } from "../kits";

/**
 * 1985 q1: a 5 kg body from rest; the force depends on its speed (the question's F–v graph): 8 N until 8 m/s, 5 N until
 * 16 m/s, 2.5 N until 20 m/s. So a = 1.6, 1, 0.5 m/s²: 8 m/s at 5 s, 16 m/s at 13 s, 20 m/s at 21 s.
 */
const m = 5;
export const spec = graphMotion({
  id: "bagrut-1985-q1",
  panel: "none",
  v: [[0, 0], [8 / (8 / m), 8], [5 + 8 / (5 / m), 16], [13 + 4 / (2.5 / m), 20]],
  names: ["start", "v8", "v16", "v20"],
  range: [0, 260],
  graph: { vMin: 0, vMax: 22 },
  shape: "block",
  answers: { "v@v8": [8, 1e-9], v8: [5, 1e-9], v16: [13, 1e-9], v20: [21, 1e-9] },
  parts: [
    { to: (mm) => mm.events.v20, pace: 0.35, caption: "הכוח תלוי במהירות, לפי הגרף. איך נראה גרף הכוח כפונקציה של הזמן?", ask: (P, mm, t) => askLabel(P, mm.state(t).b.x, 0, "F(t) ?", 0, -60) },
    { to: () => 5, pace: 0.35, caption: "מה העבודה של הכוח בחמש השניות הראשונות?", ask: (P, mm, t) => { if (t >= 5 - 1e-9) askLabel(P, mm.state(t).b.x, 0, "W = ?", 0, -60); } },
    { to: () => 10, pace: 0.35, caption: "מה האנרגיה הקינטית של הגוף אחרי עשר שניות?", ask: (P, mm, t) => { if (t >= 10 - 1e-9) askLabel(P, mm.state(t).b.x, 0, "Eₖ = ?", 0, -60); } },
    { to: (mm) => mm.events.v20, pace: 0.35, caption: "מה העבודה הכוללת של הכוח, עד שהגוף מגיע ל-20 m/s?", ask: (P, mm, t) => { if (t >= mm.events.v20 - 1e-9) askLabel(P, mm.state(t).b.x, 0, "W = ?", 0, -60); } },
  ],
  extra: (P, mm, t) => {
    // the question's graph: F against v, with a cursor at the current speed
    const G = P.graph({ xPx: 150, yPx: 22, wPx: 420, hPx: 150, tMax: 22, vMin: 0, vMax: 9, xLabel: "v (m/s)", yLabel: "F (N)" });
    for (const [a, b, f] of [[0, 8, 8], [8, 16, 5], [16, 20, 2.5]]) P.path([[G.gx(a), G.gy(f)], [G.gx(b), G.gy(f)]], { tone: "body", w: 2.4 });
    for (const v of [8, 16, 20]) P.textPx(G.gx(v), G.gy(0) + 13, String(v), { tone: "data", size: 10 });
    for (const f of [2.5, 5, 8]) P.textPx(146, G.gy(f) + 4, String(f), { tone: "data", size: 10, anchor: "end" });
    P.arrowScreen(G.gx(mm.state(t).b.vx), G.gy(0), G.gx(mm.state(t).b.vx), G.gy(8.8), { tone: "idle", w: 1 });
  },
});
