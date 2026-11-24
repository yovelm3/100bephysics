import { body, type Phase, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2011 q4: smooth slope AB, rough level BC, smooth slope up CD. The table gives vD for heights HA; the trend
 * vD² = 20·HA − 9.9 gives the least height 0.495 m; with HA = 1.1 m and D at 0.3 m the friction work is −0.4 J.
 * Drawn: AB at 45°, BC 1 m, CD at 30°; M = 0.205 kg and μ = 0.195 (so friction takes 0.4 J on BC).
 * The model's x is the distance along the track from A.
 */
const g = 10, M = 0.8 / 3.9, Lbc = 1, mu = 0.4 / (M * g * Lbc), hD = 0.3;
const a1 = (45 * Math.PI) / 180, a3 = Math.PI / 6;
const run = (HA: number): Story => {
  const Lab = HA / Math.sin(a1), sD = Lab + Lbc + hD / Math.sin(a3);
  const ph: Phase[] = [
    { end: "B", acc: { b: [g * Math.sin(a1), 0] }, dur: () => Math.sqrt((2 * Lab) / (g * Math.sin(a1))), force: () => ({ b: [g * Math.sin(a1), 0] }), until: (s) => s.b.x >= Lab },
    { end: "C", acc: { b: [-mu * g, 0] }, dur: (s) => (s.b.vx - Math.sqrt(Math.max(0, s.b.vx ** 2 - 2 * mu * g * Lbc))) / (mu * g), force: () => ({ b: [-mu * g, 0] }), until: (s) => s.b.x >= Lab + Lbc },
    { end: "D", acc: { b: [-g * Math.sin(a3), 0] }, dur: (s) => (s.b.vx - Math.sqrt(Math.max(0, s.b.vx ** 2 - 2 * g * Math.sin(a3) * (sD - Lab - Lbc)))) / (g * Math.sin(a3)), force: () => ({ b: [-g * Math.sin(a3), 0] }), until: (s) => s.b.x >= sD },
  ];
  return { init: { b: body(0, 0, 0, 0) }, phases: ph, record: { vD: ["D", (s) => s.b.vx], W: ["C", (s) => 0.5 * M * s.b.vx ** 2 - M * g * HA] } };
};
// from D's height the body stops on BC before C: a separate story that ends where it stops
const low: Story = {
  init: { b: body(0, 0, 0, 0) },
  phases: [
    { end: "B", acc: { b: [g * Math.sin(a1), 0] }, dur: () => Math.sqrt((2 * (hD / Math.sin(a1))) / (g * Math.sin(a1))), force: () => ({ b: [g * Math.sin(a1), 0] }), until: (s) => s.b.x >= hD / Math.sin(a1) },
    { end: "stop", acc: { b: [-mu * g, 0] }, dur: (s) => s.b.vx / (mu * g), force: () => ({ b: [-mu * g, 0] }), until: (s) => s.b.vx <= 0, jump: (s) => { s.b.vx = 0; } },
  ],
};
const place = (HA: number, x: number): [number, number] => {
  const Lab = HA / Math.sin(a1);
  if (x <= Lab) return [-(Lab - x) * Math.cos(a1), HA - x * Math.sin(a1)];
  if (x <= Lab + Lbc) return [x - Lab, 0];
  const u = x - Lab - Lbc; return [Lbc + u * Math.cos(a3), u * Math.sin(a3)];
};
export const spec = storySpec({
  id: "bagrut-2011-q4",
  view: { x0: -1.4, x1: 2.2, y0: -0.2, y1: 1.6 },
  scale: 3,
  scenarios: { h11: run(1.1), low },
  order: { h11: ["B", "C", "D"], low: ["B", "stop"] },
  answers: { "h11.W": [-0.4, 1e-6], "h11.vD": [Math.sqrt(12.1), 1e-6] },
  parts: [
    { to: (m) => m.events["h11.D"], pace: 1, caption: "למה שינוי של הגובה HA משנה את המהירות בנקודה D?" },
    { to: (m) => m.events["low.stop"], pace: 1, caption: "משחררים מגובה ששווה לגובה של D. האם הגוף יגיע ל-D?" },
    { to: (m) => m.events["h11.D"], pace: 1, caption: "חשבו את vD² ושרטטו את הגרף של vD² כפונקציה של HA." },
    { to: (m) => m.events["h11.D"], pace: 1, caption: "מה הגובה הקטן ביותר שממנו הגוף יגיע ל-D?" },
    { to: (m) => m.events["h11.D"], pace: 1, caption: "HA = 1.1 m, ו-D בגובה 0.3 m. מה העבודה של כוח החיכוך?" },
  ],
  draw: (P, m, t, part) => {
    const HA = part === 1 ? hD : 1.1;
    const lowHA = 1.25;
    P.line(-lowHA, lowHA, 0, 0, { tone: "line", w: 2.4 });
    P.line(0, 0, Lbc, 0, { tone: "line", w: 2.4 }); P.poly([[0, 0], [Lbc, 0], [Lbc, -0.05], [0, -0.05]], { tone: "soft", fill: "soft" });
    P.line(Lbc, 0, Lbc + 0.9 * Math.cos(a3), 0.9 * Math.sin(a3), { tone: "line", w: 2.4 });
    const D = place(1.1, 1.1 / Math.sin(a1) + Lbc + hD / Math.sin(a3));
    for (const [l, p] of [["B", [0, 0]], ["C", [Lbc, 0]], ["D", D]] as const) P.mono(p[0], p[1], l, { tone: "data", size: 11, dyPx: l === "D" ? -12 : 16 });
    const key = part === 1 ? "low" : "h11";
    const x = m.state(Math.min(t, m.events[`${key}.${part === 1 ? "stop" : "D"}`]))[`${key}.b`].x;
    const [px, py] = place(HA, x);
    P.circle(px, py + 0.04, 7, { fill: "body" });
    P.mono(-HA, HA, "A", { tone: "data", size: 11, dxPx: -12 });
    if (part === 0) askLabel(P, D[0], D[1], "vD(HA) ?", 10, -30);
    if (part === 1) askLabel(P, D[0], D[1], "?", 10, -30);
    if (part === 2) askLabel(P, D[0], D[1], "vD² (HA) ?", 10, -30);
    if (part === 3) askLabel(P, -0.6, 1.2, "HA min = ?", 0, 0);
    if (part === 4 && t >= m.events["h11.C"] - 1e-9) askLabel(P, 0.5, 0, "W(f) = ?", 0, -30);
  },
});
