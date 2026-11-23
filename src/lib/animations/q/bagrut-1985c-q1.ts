import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 1985c q1: a body slides from rest down a smooth slope of length L (drawn: 4 m at 30°). Where is its speed half the bottom speed? */
const g = 10, th = Math.PI / 6, L = 4;
const a = g * Math.sin(th);
const ax = a * Math.cos(th), ay = -a * Math.sin(th);
export const spec = storySpec({
  id: "bagrut-1985c-q1",
  view: { x0: -0.6, x1: 4.6, y0: -0.4, y1: 2.4 },
  scale: 4,
  story: {
    init: { b: body(0, L * Math.sin(th), 0, 0) },
    phases: [{
      end: "bottom",
      acc: { b: [ax, ay] },
      dur: () => Math.sqrt((2 * L) / a),
      // build 2: weight and the normal force of the slope, added as vectors
      force: () => { const N = g * Math.cos(th); return { b: [N * Math.sin(th), -g + N * Math.cos(th)] }; },
      until: (s) => s.b.y <= 0,
    }],
    record: { vBottom: ["bottom", (s) => Math.hypot(s.b.vx, s.b.vy)] },
  },
  order: ["bottom"],
  answers: { vBottom: [Math.sqrt(2 * a * L), 1e-6] },
  parts: [
    { to: (m) => m.events.bottom, pace: 1, caption: "הגוף יוצא ממנוחה ומחליק בלי חיכוך לאורך המדרון. באיזה מרחק מהראש המהירות שלו חצי מהמהירות בתחתית?" },
  ],
  draw: (P, m, t) => {
    const top = L * Math.sin(th), bx = L * Math.cos(th);
    P.poly([[0, top], [bx, 0], [0, 0]]);
    P.ground(0, -0.5, 4.5);
    P.dim(-0.25, top + 0.12, bx - 0.25, 0.12, "L", { offPx: -10 });
    const s = m.state(t).b;
    P.block(s.x, s.y, { wPx: 26, hPx: 18, angle: -th });
    const v = Math.hypot(s.vx, s.vy);
    if (v > 0.05) P.arrowPx(s.x, s.y + 0.25, s.vx * 12, -s.vy * 12, { tone: "vel", label: "v" });
    if (t >= m.events.bottom - 1e-9) askLabel(P, bx * 0.5, top * 0.5, "v/2 : ?", 10, -30);
  },
});
