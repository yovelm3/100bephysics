import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2012 q2: a body slides down a slope at constant speed, so μ = tan θ (drawn θ = 25°, m = 2 kg).
 * Then it is sent up with v0 (drawn 6 m/s): it slows at 2g·sin θ and stays where it stops. Then F (drawn 4 N) pushes it
 * down the slope for t (drawn 1 s); afterwards it slides on at constant speed to the bottom.
 * The model's x is the distance along the slope from the bottom, up positive.
 */
const g = 10, th = (25 * Math.PI) / 180, m = 2, v0 = 6, F = 4, tF = 1;
const gs = g * Math.sin(th), mu = Math.tan(th);
// build 2: weight along the slope and kinetic friction against the motion (static friction holds it when at rest)
const along = (vx: number, push = 0) => {
  const N = m * g * Math.cos(th), f = vx > 0 ? -mu * N : vx < 0 ? mu * N : 0;
  return (-m * g * Math.sin(th) + f - push) / m;
};
const L = 6.5;
export const spec = storySpec({
  id: "bagrut-2012-q2",
  view: { x0: -0.6, x1: 6.6, y0: -0.4, y1: 3.2 },
  scale: 6,
  scenarios: {
    slide: {
      init: { b: body(L - 0.4, 0, -2, 0) },
      phases: [{ end: "end", acc: {}, dur: () => 2, force: (s) => ({ b: [along(s.b.vx), 0] }), until: (_s, t) => t >= 2 - 1e-12 }],
    },
    up: {
      init: { b: body(0, 0, v0, 0) },
      phases: [
        { end: "stop", acc: { b: [-2 * gs, 0] }, dur: (s) => s.b.vx / (2 * gs), force: (s) => ({ b: [along(s.b.vx), 0] }), until: (s) => s.b.vx <= 0, jump: (s) => { s.b.vx = 0; } },
        { end: "push", acc: {}, dur: () => 1, force: () => ({}), until: (_s, t, t0) => t - t0 >= 1 - 1e-12 },
        { end: "Foff", acc: { b: [-F / m, 0] }, dur: () => tF, force: (s) => ({ b: [s.b.vx < 0 ? along(s.b.vx, F) : -F / m, 0] }), until: (_s, t, t0) => t - t0 >= tF - 1e-12 },
        { end: "bottom", acc: {}, dur: (s) => s.b.x / -s.b.vx, force: (s) => ({ b: [along(s.b.vx), 0] }), until: (s) => s.b.x <= 0 },
      ],
      record: { d: ["stop", (s) => s.b.x], v1: ["Foff", (s) => -s.b.vx], vB: ["bottom", (s) => -s.b.vx] },
    },
  },
  order: { slide: ["end"], up: ["stop", "push", "Foff", "bottom"] },
  answers: { "up.d": [(v0 * v0) / (4 * gs), 1e-9], "up.v1": [(F / m) * tF, 1e-9], "up.vB": [(F / m) * tF, 1e-9] },
  parts: [
    { to: () => 2, pace: 1, caption: "הגוף מחליק במהירות קבועה במורד. אילו כוחות פועלים עליו, ומה הכוח השקול?" },
    { to: (mm) => mm.events["up.push"], pace: 1, caption: "הגוף עולה במהירות התחלתית v₀, נעצר ונשאר במקום. למה הוא לא מחליק למטה?" },
    { to: (mm) => mm.events["up.stop"], pace: 1, caption: "איזה מרחק עובר הגוף בזמן שהוא עולה?" },
    { from: (mm) => mm.events["up.push"], to: (mm) => mm.events["up.Foff"], pace: 1, caption: "כוח F דוחף את הגוף במורד במשך t שניות. מה המהירות שלו בסוף?" },
    { from: (mm) => mm.events["up.Foff"], to: (mm) => mm.events["up.bottom"], pace: 1, caption: "האם הגוף יגיע לתחתית במהירות הזו?" },
  ],
  draw: (P, mm, t, part) => {
    const at = (x: number): [number, number] => [x * Math.cos(th), x * Math.sin(th)];
    const top = at(L);
    P.poly([[0, 0], top, [top[0], 0]]);
    P.mono(0.9, 0, "θ", { tone: "data", size: 12, dyPx: -5 });
    const b = mm.state(t)[part === 0 ? "slide.b" : "up.b"];
    const [x, y] = at(b.x);
    P.block(x, y, { wPx: 28, hPx: 18, angle: th });
    if (Math.abs(b.vx) > 0.02) P.arrowPx(x, y + 0.5, b.vx * Math.cos(th) * 10, -b.vx * Math.sin(th) * 10, { tone: "vel", label: "v" });
    const pushing = part === 3 && t >= mm.events["up.push"] && t < mm.events["up.Foff"];
    if (pushing) P.arrowPx(x, y + 0.25, -40 * Math.cos(th), 40 * Math.sin(th), { tone: "force", label: "F" });
    if (part === 0) askLabel(P, x, y, "ΣF = ?", 20, -40);
    if (part === 1 && t >= mm.events["up.stop"]) askLabel(P, x, y, "?", 20, -40);
    if (part === 2 && t >= mm.events["up.stop"] - 1e-9) askLabel(P, x / 2, y / 2, "d = ?", 0, -30);
    if (part === 3 && t >= mm.events["up.Foff"] - 1e-9) askLabel(P, x, y, "v = ?", 20, -40);
    if (part === 4) askLabel(P, x, y, "v ?", 20, -40);
  },
});
