import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2006 q3: a 0.6 kg cart at 2 m/s on a raised track; at t = 0, at the origin, a 0.2 kg ball stuck under it comes off and
 * falls freely between the rails (y down in the question; drawn with height up). Part ג: another ball, dropped from rest
 * (drawn at t = 1 s, 0.45 m above the cart), lands in the cart and sticks: 1.5 m/s.
 */
const g = 10, mc = 0.6, mb = 0.2;
export const spec = storySpec({
  id: "bagrut-2006-q3",
  view: { x0: -0.5, x1: 4.5, y0: -5.6, y1: 1.0 },
  scale: 5,
  story: {
    init: { c: body(0, 0, 2, 0), b: body(0, 0, 2, 0), d: body(2.6, 0.45, 0, 0) },
    phases: [
      { end: "t1", acc: { b: [0, -g] }, dur: () => 1, force: () => ({ b: [0, -g] }), until: (_s, t) => t >= 1 - 1e-12 },
      { end: "catch", acc: { d: [0, -g] }, dur: () => 0.3, force: () => ({ d: [0, -g] }), until: (s) => s.d.y <= 0, jump: (s) => { const V = (mc * s.c.vx) / (mc + mb); s.c.vx = V; s.d.vx = V; s.d.vy = 0; s.d.y = 0; s.d.x = s.c.x; } },
      { end: "end", acc: {}, dur: () => 0.5, force: () => ({}), until: (_s, t, t0) => t - t0 >= 0.5 - 1e-12 },
    ],
    record: { xc: ["t1", (s) => s.c.x], yb: ["t1", (s) => -s.b.y], vb: ["t1", (s) => Math.hypot(s.b.vx, s.b.vy)], V: ["catch", (s) => s.c.vx] },
  },
  order: ["t1", "catch", "end"],
  answers: { xc: [2, 1e-9], yb: [5, 1e-9], vb: [10.198039027185569, 1e-9], V: [1.5, 1e-9] },
  parts: [
    { to: () => 1, pace: 1.5, caption: "הכדור ניתק מהקרונית ב-t = 0. האם מהירות הקרונית השתנתה?" },
    { to: () => 1, pace: 1.5, caption: "מה שיעור ה-x של הקרונית ברגע t = 1 s?" },
    { to: () => 1, pace: 1.5, caption: "מה שיעורי ה-x וה-y של הכדור ברגע t = 1 s?" },
    { to: () => 1, pace: 1.5, caption: "מה המהירות של הכדור, בגודל ובכיוון, ברגע t = 1 s?" },
    { to: (m) => m.events.end, pace: 1.5, caption: "כדור זהה נשמט ממנוחה ונדבק לקרונית הנוסעת. מה המהירות של הקרונית עם הכדור?" },
  ],
  draw: (P, m, t, part) => {
    const s = m.state(t);
    P.line(-0.4, 0, 4.4, 0, { tone: "line", w: 2 });
    P.arrow(0, 0, 0, -5.4, { tone: "idle", w: 1 }); P.mono(0, -5.4, "y", { tone: "data", size: 12, dxPx: -10 });
    P.cart(s.c.x, 0, { wPx: 44 });
    if (part < 4) { P.circle(s.b.x, s.b.y - 0.1, 6, { fill: "runner" }); P.arrowPx(s.b.x, s.b.y - 0.1, s.b.vx * 4, -s.b.vy * 4, { tone: "vel" }); }
    if (part === 4 && t >= 1) P.circle(s.d.x, s.d.y + 0.15, 6, { fill: "runner" });
    const at1 = t >= 1 - 1e-9;
    if (part === 0) askLabel(P, s.c.x, 0, "v ?", 16, -30);
    if (part === 1 && at1) askLabel(P, s.c.x, 0, "x = ?", 16, -30);
    if (part === 2 && at1) askLabel(P, s.b.x, s.b.y, "(x, y) = ?", 16, 0);
    if (part === 3 && at1) askLabel(P, s.b.x, s.b.y, "v = ?", 16, 0);
    if (part === 4 && t >= m.events.catch - 1e-9) askLabel(P, s.c.x, 0, "V = ?", 16, -30);
  },
});
