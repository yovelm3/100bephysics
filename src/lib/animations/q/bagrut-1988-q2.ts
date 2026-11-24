import { body } from "../engine";
import { askLabel, askWidth, fallPhase, storySpec } from "../kits";

/**
 * 1988 q2: a 0.5 kg lump thrown horizontally at 8 m/s from a 5 m roof lands after 1 s, 8 m away, in a 1.5 kg cart and
 * sticks: the horizontal momentum is shared (2 m/s); then friction (μ = 0.2) stops them after 1 m.
 */
const g = 10, mp = 0.5, mc = 1.5, mu = 0.2;
export const spec = storySpec({
  id: "bagrut-1988-q2",
  view: { x0: -2.5, x1: 11, y0: -0.6, y1: 6.2 },
  scale: 10,
  story: {
    init: { p: body(0, 5, 8, 0), c: body(8, 0, 0, 0) },
    phases: [
      { ...fallPhase({ end: "land", body: "p", toY: 0 }), jump: (s) => { const V = (mp * s.p.vx) / (mp + mc); s.p.vx = V; s.p.vy = 0; s.p.y = 0; s.c.vx = V; } },
      { end: "stop", acc: { p: [-mu * g, 0], c: [-mu * g, 0] }, dur: (s) => s.c.vx / (mu * g), force: () => ({ p: [-mu * g, 0], c: [-mu * g, 0] }), until: (s) => s.c.vx <= 0, jump: (s) => { s.c.vx = 0; s.p.vx = 0; } },
    ],
    record: { d: ["land", (s) => s.p.x], V: ["land", (s) => s.c.vx], dist: ["stop", (s) => s.c.x - 8] },
  },
  order: ["land", "stop"],
  answers: { d: [8, 1e-9], V: [2, 1e-9], dist: [1, 1e-9] },
  parts: [
    { to: (m) => m.events.land, pace: 1.5, caption: "הגוש נזרק אופקית מגובה 5 m. באיזה מרחק מהבניין הוא פוגע בקרונית?" },
    { to: (m) => m.events.land, pace: 1.5, caption: "מה גודל המהירות של הגוש רגע לפני הפגיעה, ומה הזווית שלה עם האופק?" },
    { to: (m) => m.events.land + 0.2, pace: 1.5, caption: "הגוש נדבק לקרונית. מה המהירות המשותפת מיד אחרי ההתנגשות?" },
    { to: (m) => m.events.stop, pace: 1.5, caption: "μ = 0.2. איזה מרחק עוברת הקרונית עד שהיא נעצרת?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -2.4, 10.8);
    P.poly([[-2, 0], [0, 0], [0, 5], [-2, 5]]);
    const s = m.state(t), landed = t >= m.events.land - 1e-9;
    P.cart(s.c.x, 0, { wPx: 50, tone: "b2" });
    P.circle(s.p.x, landed ? 0.55 : s.p.y + 0.1, 6, { fill: "runner" });
    if (!landed) P.arrowPx(s.p.x, s.p.y + 0.1, s.p.vx * 5, -s.p.vy * 5, { tone: "vel", label: "v" });
    else if (s.c.vx > 0.02) P.arrowPx(s.c.x, 1.2, s.c.vx * 18, 0, { tone: "vel", label: "v" });
    if (part === 0 && landed) askWidth(P, 0, 8, 0, "d = ?", 40);
    if (part === 1 && t >= m.events.land - 0.05) askLabel(P, s.p.x, 0.6, "v = ?, θ = ?", -100, -30);
    if (part === 2 && landed) askLabel(P, s.c.x, 1.2, "V = ?", 20, -20);
    if (part === 3 && t >= m.events.stop - 1e-9) askWidth(P, 8, s.c.x, 0, "d = ?", 40);
  },
});
