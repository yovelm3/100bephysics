import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2017 q2: box M = 0.8 kg on a table, tied over a pulley to a basket; sand is added slowly (the basket's weight W grows
 * 1 N/s from 1 N). Static friction holds the box until W = μs·M·g = 4 N; then kinetic friction is 2.5 N.
 * The model's w.x is W. Second story: W = 6 N from the start (a = 2.5 m/s²).
 */
const g = 10, M = 0.8, muS = 0.5, muK = 0.3125;
const fill: Story = {
  init: { w: body(1, 0, 1, 0), b: body(0, 0, 0, 0) },
  phases: [
    { end: "slip", acc: {}, dur: () => muS * M * g - 1, force: () => ({}), until: (s) => s.w.x >= muS * M * g, jump: (s) => { s.w.vx = 0; } },
    { end: "end", acc: { b: [(muS * M * g - muK * M * g) / (M + (muS * M * g) / g), 0] }, dur: () => 1, force: (s) => { const W = s.w.x, mb = W / g; return { b: [(W - muK * M * g) / (M + mb), 0] }; }, until: (_s, t, t0) => t - t0 >= 1 - 1e-12 },
  ],
};
const six: Story = {
  init: { w: body(6, 0, 0, 0), b: body(0, 0, 0, 0) },
  phases: [{ end: "end", acc: { b: [(6 - muK * M * g) / (M + 0.6), 0] }, dur: () => 1, force: () => ({ b: [(6 - muK * M * g) / (M + 6 / g), 0] }), until: (_s, t) => t >= 1 - 1e-12 }],
  record: { a: ["end", (s) => s.b.vx] },
};
export const spec = storySpec({
  id: "bagrut-2017-q2",
  view: { x0: -0.5, x1: 3.5, y0: -1.3, y1: 0.7 },
  scale: 2,
  scenarios: { fill, six },
  order: { fill: ["slip", "end"], six: ["end"] },
  answers: { "six.a": [2.5, 1e-9], "fill.slip": [3, 1e-9] },
  parts: [
    { to: (m) => m.events["fill.slip"], pace: 1, caption: "מוסיפים חול לסלסלה לאט. למה גרף כוח החיכוך כפונקציה של W חייב לעבור בראשית?" },
    { to: (m) => m.events["fill.end"], pace: 1, caption: "M = 0.8 kg. מה מקדם החיכוך הסטטי, ומה הקינטי?" },
    { to: () => 1, pace: 1, caption: "מה התאוצה של המערכת כאשר W = 6 N?" },
    { from: (m) => m.events["fill.slip"] - 0.6, to: (m) => m.events["fill.end"], pace: 1.5, caption: "כשהמערכת עוברת ממנוחה לתנועה: האם המתיחות בחבל גדלה, קטנה או לא משתנה?" },
  ],
  draw: (P, m, t, part) => {
    const key = part === 2 ? "six" : "fill";
    const s = m.state(t), W = s[`${key}.w`].x, b = s[`${key}.b`];
    // the question's graph: f against W
    const G = P.graph({ xPx: 440, yPx: 30, wPx: 240, hPx: 170, tMax: 8, vMin: 0, vMax: 4.5, xLabel: "W (N)", yLabel: "f (N)" });
    P.path([[G.gx(1), G.gy(1)], [G.gx(4), G.gy(4)]], { tone: "body", w: 2.2 });
    P.path([[G.gx(4), G.gy(2.5)], [G.gx(7), G.gy(2.5)]], { tone: "body", w: 2.2 });
    for (const w of [1, 2, 3, 4, 5, 6, 7]) P.textPx(G.gx(w), G.gy(0) + 13, String(w), { tone: "data", size: 10 });
    for (const f of [1, 2, 3, 4]) P.textPx(436, G.gy(f) + 4, String(f), { tone: "data", size: 10, anchor: "end" });
    P.arrowScreen(G.gx(W), G.gy(0), G.gx(W), G.gy(4.4), { tone: "idle", w: 1 });
    P.poly([[-0.45, 0], [1.4, 0], [1.4, -0.06], [-0.45, -0.06]]);
    P.pulley(1.43, 0.04, 9);
    P.block(b.x, 0, { wPx: 44, hPx: 28, label: "M" });
    P.line(b.x + 0.16, 0.1, 1.43, 0.1, { tone: "line", w: 1.3 });
    const by = -0.3 - 0.3 * b.x;
    P.line(1.52, 0.04, 1.52, by + 0.06, { tone: "line", w: 1.3 });
    P.poly([[1.44, by + 0.06], [1.6, by + 0.06], [1.57, by - 0.06], [1.47, by - 0.06]], { fill: "runner", tone: "runner" });
    P.mono(1.68, by, `W`, { tone: "data", size: 11, anchor: "start" });
    if (part === 0) askLabel(P, b.x, 0, "f(W = 0) ?", 0, 30);
    if (part === 1) askLabel(P, b.x, 0, "μs = ?, μk = ?", 0, 30);
    if (part === 2) askLabel(P, b.x, 0, "a = ?", 0, 30);
    if (part === 3) askLabel(P, 0.9, 0.1, "T ?", 0, -20);
  },
});
