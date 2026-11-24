import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1980 q2: rain falls straight down into an open toy cart at 0.4 kg/s; the cart moves at 2 m/s on a smooth track.
 * Build 1: with F = rate·v the speed stays 2 m/s. Build 2: Newton's law for a growing mass, dp/dt = F: the
 * acceleration is (F − rate·v)/m(t) at every step (drawn: the cart's starting mass 2 kg). The model's c.y is its mass.
 */
const rate = 0.4, v = 2, F = rate * v, m0 = 2;
export const spec = storySpec({
  id: "bagrut-1980-q2",
  view: { x0: -0.5, x1: 10.5, y0: -0.6, y1: 4.9 },
  scale: 8,
  story: {
    init: { c: body(0, m0, v, rate) },
    phases: [{ end: "end", acc: {}, dur: () => 4, force: (s) => ({ c: [(F - rate * s.c.vx) / s.c.y, 0] }), until: (_s, t) => t >= 4 - 1e-12 }],
    record: { v: ["end", (s) => s.c.vx], P: ["end", (s) => F * s.c.vx] },
  },
  order: ["end"],
  answers: { v: [2, 1e-9], P: [1.6, 1e-9] },
  parts: [
    { to: () => 4, pace: 1, caption: "הגשם נופל לתוך הקרונית. איזה כוח דרוש כדי שהיא תמשיך לנוע במהירות קבועה?" },
    { to: () => 4, pace: 1, caption: "מה ההספק שדרוש כדי לשמור על המהירות?" },
    { to: () => 4, pace: 1, caption: "מה קורה לאנרגיה שההספק נותן לקרונית?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -0.4, 10.4);
    const c = m.state(t).c;
    // falling drops (decoration: straight down)
    for (let i = 0; i < 26; i++) { const x = (i * 0.41) % 10.2, y = 4.6 - (((t * 3 + i * 0.37) % 1) * 4); P.line(x, y, x, y - 0.18, { tone: "vel", w: 1.4 }); }
    P.cart(c.x, 0, { wPx: 70 });
    const fill = Math.min(1, (c.y - m0) / 2);
    P.poly([[c.x - 0.8, 0.25], [c.x + 0.8, 0.25], [c.x + 0.8, 0.25 + 0.3 * fill], [c.x - 0.8, 0.25 + 0.3 * fill]], { tone: "vel", fill: "vel" });
    P.arrowPx(c.x + 1.1, 0.4, 40, 0, { tone: "force", label: "F" });
    P.arrowPx(c.x, 1.2, c.vx * 18, 0, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, c.x + 1.1, 0.4, "F = ?", 30, -14);
    if (part === 1) askLabel(P, c.x, 1.2, "P = ?", 30, -14);
    if (part === 2) askLabel(P, c.x, 1.2, "E ?", 30, -14);
  },
});
