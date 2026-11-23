import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1999 q3: a 50 kg acrobat holds the middle of a rope tied to two poles; the angle between the two halves is 40°.
 * Story 1: the poles move apart slowly (0.1 m/s each) from close together; the event is the 40° moment.
 * Story 2 (figure ד): one pole lifts her on a vertical rope, first at a constant speed, then with acceleration up.
 */
const g = 10, mass = 50, Lh = 3; // half of the rope
const halfAt = (gap: number) => Math.asin(Math.min(1, gap / 2 / Lh));
const gap0 = 0.6, u = 0.1;
export const spec = storySpec({
  id: "bagrut-1999-q3",
  view: { x0: -4, x1: 4, y0: -0.4, y1: 3.6 },
  scale: 6,
  scenarios: {
    spread: {
      init: { p: body(gap0 / 2, 0, u, 0) },
      phases: [
        { end: "at40", acc: {}, dur: () => (2 * Lh * Math.sin((20 * Math.PI) / 180) - gap0) / (2 * u), force: () => ({}), until: (s) => halfAt(2 * s.p.x) >= (20 * Math.PI) / 180 },
        { end: "far", acc: {}, dur: () => 10, force: () => ({}), until: (_s, t, t0) => t - t0 >= 10 - 1e-9 },
      ],
      record: { T: ["at40", (s) => (mass * g) / (2 * Math.cos(halfAt(2 * s.p.x)))] },
    },
    lift: {
      init: { a: body(0, 0.3, 0, 0.5) },
      phases: [
        { end: "accel", acc: {}, dur: () => 2, force: () => ({}), until: (_s, t) => t >= 2 - 1e-12 },
        { end: "end", acc: { a: [0, 2] }, dur: () => 1, force: () => ({ a: [0, 2] }), until: (_s, t) => t >= 3 - 1e-12 },
      ],
    },
  },
  order: { spread: ["at40", "far"], lift: ["accel", "end"] },
  answers: { "spread.T": [266.044443118978, 1e-6] },
  parts: [
    { to: (m) => m.events["spread.at40"], pace: 0.25, caption: "המוטות מתרחקים לאט. כשהזווית בין שני חלקי החבל 40°: מה המתיחות בחבל?" },
    { to: (m) => m.events["spread.far"], pace: 0.25, caption: "פעם המוטות קרובים ופעם רחוקים. באיזה מצב החבל נקרע?" },
    { to: (m) => m.events["lift.end"], pace: 1, caption: "מרימים את המוט: קודם במהירות קבועה, ואחר כך בתאוצה כלפי מעלה. למה החבל נקרע רק בתאוצה?" },
  ],
  draw: (P, m, t, part) => {
    if (part < 2) {
      const s = m.state(t)["spread.p"];
      const x = s.x, half = halfAt(2 * x), dip = Lh * Math.cos(half);
      const yTop = 3.3;
      for (const sx of [-x, x]) P.block(sx, yTop, { wPx: 30, hPx: 8, base: false, tone: "line" });
      const tip: [number, number] = [0, yTop - dip];
      P.line(-x, yTop, tip[0], tip[1], { tone: "line", w: 1.6 });
      P.line(x, yTop, tip[0], tip[1], { tone: "line", w: 1.6 });
      P.circle(0, tip[1] - 0.15, 6, { fill: "runner" });
      P.line(0, tip[1] - 0.25, 0, tip[1] - 0.6, { tone: "runner", w: 3 });
      if (part === 0 && t >= m.events["spread.at40"] - 1e-9) { P.mono(0, tip[1], "40°", { tone: "data", size: 12, dyPx: -18 }); askLabel(P, x / 2, (yTop + tip[1]) / 2, "T = ?", 14, 0); }
      if (part === 1) askLabel(P, 0, 3.4, "?", 0, -10);
    } else {
      const s = m.state(t)["lift.a"];
      P.block(0, s.y + 1.2, { wPx: 30, hPx: 8, base: false, tone: "line" });
      P.line(0, s.y + 1.2, 0, s.y + 0.2, { tone: "line", w: 1.6 });
      P.circle(0, s.y + 0.05, 6, { fill: "runner" });
      P.line(0, s.y - 0.05, 0, s.y - 0.4, { tone: "runner", w: 3 });
      P.arrowPx(0.4, s.y, 0, -s.vy * 40, { tone: "vel", label: "v" });
      if (t >= 2) P.arrowPx(0.8, s.y, 0, -40, { tone: "force", label: "a" });
      askLabel(P, 0, s.y + 1, "?", 20, 0);
    }
  },
});
