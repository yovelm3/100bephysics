import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1992 q2 (from above): a hovercraft (80 kg) with a boy (45 kg) moves at 3 m/s. At t = 1 s the boy jumps sideways,
 * perpendicular to the motion at 4 m/s; the deck is 1.25 m high, so he lands 0.5 s later. The craft recoils sideways
 * (2.25 m/s). The model's z.y is the boy's height above the ground.
 */
const g = 10, M = 80, mb = 45, v = 3, u = 4;
export const spec = storySpec({
  id: "bagrut-1992-q2",
  view: { x0: -0.5, x1: 9.5, y0: -2.6, y1: 3.4 },
  scale: 8,
  story: {
    init: { c: body(0, 0, v, 0), b: body(0, 0, v, 0), z: body(0, 1.25, 0, 0) },
    phases: [
      { end: "jump", acc: {}, dur: () => 1, force: () => ({}), until: (_s, t) => t >= 1 - 1e-12, jump: (s) => { s.b.vy = u; s.c.vy = -(mb * u) / M; } },
      { end: "land", acc: { z: [0, -g] }, dur: (s) => Math.sqrt((2 * s.z.y) / g), force: () => ({ z: [0, -g] }), until: (s) => s.z.y <= 0, jump: (s) => { s.b.vx = 0; s.b.vy = 0; } },
      { end: "end", acc: {}, dur: () => 0.6, force: () => ({}), until: (_s, t, t0) => t - t0 >= 0.6 - 1e-12 },
    ],
    record: { d: ["land", (s) => Math.hypot(s.b.x - (v * 1), s.b.y)], ang: ["land", (s) => (Math.atan2(-s.c.vy, s.c.vx) * 180) / Math.PI], vc: ["land", (s) => Math.hypot(s.c.vx, s.c.vy)] },
  },
  order: ["jump", "land", "end"],
  answers: { d: [2.5, 1e-9], ang: [36.86989764584402, 1e-6], vc: [3.75, 1e-9] },
  parts: [
    { to: () => 1, pace: 1, caption: "זורקים כדור אנכית מהרחפת ותופסים אותו עליה. מה המרחק, על הרחפת, בין מקום הזריקה למקום התפיסה?" },
    { to: (m) => m.events.land, pace: 1, caption: "הנער קופץ מהרחפת בניצב לכיוון התנועה. באיזה מרחק אופקי מנקודת הקפיצה הוא נוחת?" },
    { to: (m) => m.events.end, pace: 1, caption: "מה הזווית בין כיוון התנועה החדש של הרחפת לכיוון המקורי?" },
    { to: (m) => m.events.end, pace: 1, caption: "מה גודל המהירות של הרחפת אחרי הקפיצה?" },
  ],
  draw: (P, m, t, part) => {
    const s = m.state(t), jumped = t >= 1 - 1e-9;
    P.line(-0.4, 0, 9.4, 0, { tone: "idle", w: 1, dash: "6 5" });
    P.poly([[s.c.x - 0.7, s.c.y - 0.45], [s.c.x + 0.7, s.c.y - 0.45], [s.c.x + 0.9, s.c.y], [s.c.x + 0.7, s.c.y + 0.45], [s.c.x - 0.7, s.c.y + 0.45]], { tone: "b2" });
    P.circle(s.b.x, s.b.y, 8 + 3 * s.z.y * (jumped ? 1 : 0), { fill: "runner" });
    P.arrowPx(s.c.x, s.c.y - 0.75, s.c.vx * 12, -s.c.vy * 12, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, s.c.x, s.c.y, "Δx = ?", 0, -50);
    if (part === 1 && t >= m.events.land - 1e-9) { P.circle(3, 0, 3, { fill: "data" }); askLabel(P, s.b.x, s.b.y, "d = ?", 16, 0); }
    if (part === 2 && jumped) askLabel(P, s.c.x, s.c.y - 0.75, "θ = ?", 30, 10);
    if (part === 3 && jumped) askLabel(P, s.c.x, s.c.y - 0.75, "v = ?", 30, 10);
  },
});
