import { body } from "../engine";
import { askLabel, askSpan, storySpec } from "../kits";

/**
 * 2002 q4: a cart with a vertical chimney; a spring (K = 80 N/m) compressed 10 cm shoots a 40 g ball straight up
 * (relative to the cart) while the cart moves at a constant speed (drawn 1.5 m/s). From the relaxed spring's top the
 * ball rises 0.9 m. The model starts as the ball leaves the spring (4.24 m/s up).
 */
const g = 10, K = 80, x0 = 0.1, mb = 0.04, V = 1.5;
const vUp = Math.sqrt((K * x0 * x0) / mb - 2 * g * x0);
export const spec = storySpec({
  id: "bagrut-2002-q4",
  view: { x0: -0.5, x1: 3.5, y0: -0.2, y1: 1.8 },
  scale: 2,
  story: {
    init: { c: body(0.3, 0, V, 0), b: body(0.3, 0.6, V, vUp) },
    phases: [
      { end: "top", acc: { b: [0, -g] }, dur: (s) => s.b.vy / g, force: () => ({ b: [0, -g] }), until: (s) => s.b.vy <= 0 },
      { end: "back", acc: { b: [0, -g] }, dur: (s) => Math.sqrt((2 * (s.b.y - 0.6)) / g), force: () => ({ b: [0, -g] }), until: (s) => s.b.y <= 0.6 },
    ],
    record: { h: ["top", (s) => s.b.y - 0.6], dx: ["back", (s) => s.b.x - s.c.x] },
  },
  order: ["top", "back"],
  answers: { h: [0.9, 1e-9], dx: [0, 1e-9] },
  parts: [
    { to: (m) => m.events.top, pace: 1.2, caption: "הקפיץ משתחרר והכדור נורה מהארובה. לאיזה גובה מעל קצה הקפיץ הרפוי הוא עולה?" },
    { to: (m) => m.events.back * 0.9, pace: 1.2, caption: "איפה ייפול הכדור: לפני הארובה, לתוכה, או מאחוריה?" },
    { to: (m) => m.events.back * 0.9, pace: 1.2, caption: "איך נראה המסלול של הכדור בעיני צופה שנוסע על הקרונית?" },
    { to: (m) => m.events.back * 0.9, pace: 1.2, caption: "האם מהירות הקרונית אחרי שהכדור נורה שווה למהירות שלפני כן?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -0.4, 3.4);
    const s = m.state(t);
    P.cart(s.c.x, 0, { wPx: 60, tone: "b2" });
    P.poly([[s.c.x - 0.05, 0.3], [s.c.x + 0.05, 0.3], [s.c.x + 0.05, 0.6], [s.c.x - 0.05, 0.6]], { fill: "none" });
    P.circle(s.b.x, s.b.y + 0.02, 5, { fill: "body" });
    P.arrowPx(s.c.x - 0.3, 0.25, V * 14, 0, { tone: "vel", label: "v" });
    if (part === 0 && t >= m.events.top - 1e-9) askSpan(P, s.b.x + 0.15, 0.6, s.b.y, "h = ?", 0);
    if (part === 1) askLabel(P, s.c.x, 0.6, "?", 20, -10);
    if (part === 2) askLabel(P, s.b.x, s.b.y, "?", 16, 0);
    if (part === 3) askLabel(P, s.c.x - 0.3, 0.25, "v ?", -10, -20);
  },
});
