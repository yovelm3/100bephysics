import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 2002 q2: cart M = 0.6 kg tied over a pulley to m = 0.04 kg; a student holds the cart until t = 1 s, then lets go. */
const g = 10, M = 0.6, m = 0.04;
const a = (m * g) / (M + m);
export const spec = storySpec({
  id: "bagrut-2002-q2",
  view: { x0: -0.9, x1: 0.5, y0: -0.48, y1: 0.22 },
  scale: 0.5,
  story: {
    init: { c: body(-0.6, 0, 0, 0), w: body(0, -0.12, 0, 0) },
    phases: [
      { end: "release", acc: {}, dur: () => 1, force: () => ({}), until: (_s, t) => t >= 1 - 1e-12 },
      // build 2: the cart pulled by the tension T, the weight by mg − T
      { end: "end", acc: { c: [a, 0], w: [0, -a] }, dur: () => 1, force: () => { const T = (M * m * g) / (M + m); return { c: [T / M, 0], w: [0, -(m * g - T) / m] }; }, until: (_s, t) => t >= 2 - 1e-12 },
    ],
    record: { a: ["end", (s) => s.c.vx / 1], T: ["end", (s) => M * (s.c.vx / 1)] },
  },
  order: ["release", "end"],
  answers: { a: [0.625, 1e-9], T: [0.375, 1e-9] },
  parts: [
    { to: () => 2, pace: 1.2, caption: "הגדירו: מהו ניוטון אחד?" },
    { to: () => 2, pace: 1.2, caption: "עד t = 1 s התלמיד מחזיק את הקרונית. איך נראה גרף התאוצה עד t = 2 s, ומה התאוצה אחרי השחרור?" },
    { to: () => 2, pace: 1.2, caption: "איך נראה גרף המתיחות בחוט עד t = 2 s? מה המתיחות לפני השחרור, ומה אחריו?" },
  ],
  draw: (P, mm, t, part) => {
    const s = mm.state(t);
    P.poly([[-0.85, 0], [0.02, 0], [0.02, -0.03], [-0.85, -0.03]]);
    P.pulley(0.03, 0.025, 9);
    P.cart(s.c.x, 0, { wPx: 60, label: "M" });
    P.line(s.c.x + 0.08, 0.04, 0.03, 0.04, { tone: "line", w: 1.4 });
    P.line(0.055, 0.025, 0.055, s.w.y + 0.03, { tone: "line", w: 1.4 });
    P.block(0.055, s.w.y, { wPx: 18, hPx: 20, base: false, label: "m", tone: "b2" });
    if (t < 1) { P.person(s.c.x - 0.16, 0, t, { tone: "runner", facing: 1 }); P.line(s.c.x - 0.14, 0.05, s.c.x - 0.08, 0.04, { tone: "runner", w: 3 }); }
    if (s.c.vx > 0.01) P.arrowPx(s.c.x, 0.12, s.c.vx * 60, 0, { tone: "vel", label: "v" });
    if (part === 1) askLabel(P, s.c.x, 0, "a(t) ?", 0, -70);
    if (part === 2) askLabel(P, (s.c.x + 0.03) / 2, 0.04, "T(t) ?", 0, -24);
    if (part === 0) askLabel(P, s.c.x, 0, "1 N = ?", 0, -70);
  },
});
