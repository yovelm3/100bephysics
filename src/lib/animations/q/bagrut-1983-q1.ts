import { body, type State, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1983 q1: a body slides from rest down a slope (drawn α = 30°, 2 m), bounces elastically off a wall perpendicular to
 * the slope at its bottom, and goes back up until it stops. Smooth, and with friction (drawn μ = 0.2).
 * The model's x is the distance from the wall along the slope.
 */
const g = 10, al = Math.PI / 6, L = 2;
const run = (mu: number): Story => {
  const down = g * (Math.sin(al) - mu * Math.cos(al)), up = g * (Math.sin(al) + mu * Math.cos(al));
  const f = (s: State) => -g * Math.sin(al) + (s.b.vx < 0 ? 1 : -1) * mu * g * Math.cos(al);
  return {
    init: { b: body(L, 0, 0, 0) },
    phases: [
      { end: "wall", acc: { b: [-down, 0] }, dur: () => Math.sqrt((2 * L) / down), force: (s) => ({ b: [f(s), 0] }), until: (s) => s.b.x <= 0, jump: (s) => { s.b.vx = -s.b.vx; s.b.x = 0; } },
      { end: "stop", acc: { b: [-up, 0] }, dur: (s) => s.b.vx / up, force: (s) => ({ b: [f(s), 0] }), until: (s) => s.b.vx <= 0, jump: (s) => { s.b.vx = 0; } },
    ],
  };
};
export const spec = storySpec({
  id: "bagrut-1983-q1",
  view: { x0: -0.4, x1: 2.4, y0: -0.25, y1: 1.15 },
  scale: 2,
  scenarios: { smooth: run(0), rough: run(0.2) },
  order: { smooth: ["wall", "stop"], rough: ["wall", "stop"] },
  answers: { "smooth.stop": [2 * Math.sqrt((2 * L) / (g * Math.sin(al))), 1e-9] },
  parts: [
    { to: (m) => m.events["smooth.stop"], pace: 1.2, hideClock: true, caption: "מדרון חלק: מה היחס בין זמן הירידה לזמן העלייה?" },
    { to: (m) => m.events["rough.stop"], pace: 1.2, hideClock: true, caption: "עכשיו יש חיכוך עם מקדם μ. מה היחס בין זמן הירידה לזמן העלייה?" },
    { to: (m) => m.events["rough.stop"], pace: 1.2, caption: "הראו שהתשובה למדרון החלק היא מקרה פרטי של התשובה עם חיכוך." },
  ],
  draw: (P, m, t, part) => {
    const key = part === 0 ? "smooth" : "rough";
    const b = m.state(Math.min(t, m.events[`${key}.stop`]))[`${key}.b`];
    const at = (x: number): [number, number] => [x * Math.cos(al), x * Math.sin(al)];
    const top = at(L + 0.2);
    P.poly([[0, 0], top, [top[0], 0]]);
    // the wall at the bottom, perpendicular to the slope
    P.line(0, 0, -0.18, 0.31, { tone: "line", w: 4 });
    const [x, y] = at(b.x);
    P.block(x + 0.06, y, { wPx: 24, hPx: 16, angle: al });
    if (Math.abs(b.vx) > 0.05) P.arrowPx(x, y + 0.22, b.vx * Math.cos(al) * 10, -b.vx * Math.sin(al) * 10, { tone: "vel", label: "v" });
    if (part === 1) P.poly([[0, 0], top, [top[0] - 0.02, top[1] - 0.02], [0.02, -0.02]], { tone: "soft", fill: "none", w: 4 });
    askLabel(P, 1.2, 1.0, part === 2 ? "μ = 0 ?" : "t↓ / t↑ = ?", 0, 0);
  },
});
