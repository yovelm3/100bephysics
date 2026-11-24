import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1980r q2: two 1 kg bodies joined by a compressed spring slide together at v0; the spring is released (drawn at
 * t = 1 s, in an instant) and they leave at 3 m/s along x and 4 m/s along y. Seen from above.
 */
const v0x = 1.5, v0y = 2;
export const spec = storySpec({
  id: "bagrut-1980r-q2",
  view: { x0: -0.6, x1: 7.4, y0: -0.6, y1: 6.6 },
  scale: 6,
  story: {
    init: { a: body(0, 0, v0x, v0y), b: body(0.12, 0.12, v0x, v0y) },
    phases: [
      { end: "release", acc: {}, dur: () => 1, force: () => ({}), until: (_s, t) => t >= 1 - 1e-12, jump: (s) => { s.a.vx = 3; s.a.vy = 0; s.b.vx = 0; s.b.vy = 4; } },
      { end: "end", acc: {}, dur: () => 1, force: () => ({}), until: (_s, t) => t >= 2 - 1e-12 },
    ],
    record: { v0: ["release", () => Math.hypot(v0x, v0y)], E: ["release", (s) => 0.5 * (s.a.vx ** 2 + s.a.vy ** 2 + s.b.vx ** 2 + s.b.vy ** 2) - 0.5 * 2 * (v0x ** 2 + v0y ** 2)] },
  },
  order: ["release", "end"],
  answers: { v0: [2.5, 1e-9], E: [6.25, 1e-9] },
  parts: [
    { to: () => 2, pace: 1, caption: "הקפיץ משתחרר, וגוף אחד נע לאורך x ב-3 m/s והשני לאורך y ב-4 m/s. מה הייתה המהירות המשותפת לפני כן?" },
    { to: () => 2, pace: 1, caption: "כמה אנרגיה הייתה אגורה בקפיץ המכווץ?" },
    { to: () => 2, pace: 1, caption: "הקפיץ מכווץ פי שניים, והגופים במסות אחרות ובמנוחה. מה המהירויות שלהם אחרי השחרור?" },
  ],
  draw: (P, m, t, part) => {
    P.arrow(-0.4, -0.3, 7.2, -0.3, { tone: "line", w: 1 }); P.mono(7.2, -0.3, "x", { tone: "text", size: 12, dyPx: 14 });
    P.arrow(-0.4, -0.3, -0.4, 6.4, { tone: "line", w: 1 }); P.mono(-0.4, 6.4, "y", { tone: "text", size: 12, dxPx: -10 });
    const s = m.state(t), before = t < 1;
    if (before) P.spring(s.a.x, s.a.y, s.b.x, s.b.y, { coils: 3, ampPx: 4 });
    P.circle(s.a.x, s.a.y, 9, { fill: "body" }); P.circle(s.b.x, s.b.y, 9, { fill: "b2" });
    if (before) P.arrowPx(s.a.x, s.a.y, v0x * 16, -v0y * 16, { tone: "vel", label: "v₀" });
    else { P.arrowPx(s.a.x, s.a.y, 48, 0, { tone: "vel", label: "3 m/s" }); P.arrowPx(s.b.x, s.b.y, 0, -64, { tone: "vel", label: "4 m/s" }); }
    if (part === 0) askLabel(P, 1.5, 2, "v₀ = ?, θ = ?", -20, -40);
    if (part === 1) askLabel(P, 1.5, 2, "E = ?", -20, -40);
    if (part === 2) askLabel(P, 1.5, 2, "v₁, v₂ = ?", -20, -40);
  },
});
