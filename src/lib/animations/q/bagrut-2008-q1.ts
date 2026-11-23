import { body, type State } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 2008 q1: a car crosses the red light (x = 0) at 25 m/s at t = 0, brakes from 5 s to stop at 15 s; a police motorcycle at x = 30 m starts at 2 m/s². */
const am = 2, ac = -2.5;
const acc = (s: State, t: number) => ({ c: [t < 5 ? 0 : ac, 0] as [number, number], m: [am, 0] as [number, number] });
export const spec = storySpec({
  id: "bagrut-2008-q1",
  view: { x0: -10, x1: 270, y0: -30, y1: 50 },
  scale: 260,
  story: {
    init: { c: body(0, 0, 25, 0), m: body(30, 0) },
    phases: [
      { end: "pass1", acc: { c: [0, 0], m: [am, 0] }, dur: () => (25 - Math.sqrt(625 - 120)) / 2, force: acc, until: (s) => s.c.x >= s.m.x },
      { end: "brake", acc: { c: [0, 0], m: [am, 0] }, dur: (_s, t0) => 5 - t0, force: acc, until: (_s, t) => t >= 5 - 1e-12 },
      { end: "pass2", acc: { c: [ac, 0], m: [am, 0] }, dur: () => (15 + Math.sqrt(225 + 630)) / 4.5, force: acc, until: (s) => s.m.x >= s.c.x },
      { end: "stop", acc: { c: [ac, 0], m: [am, 0] }, dur: (_s, t0) => 15 - t0, force: acc, until: (_s, t) => t >= 15 - 1e-12 },
    ],
    marks: { sameV: [() => 37.5 / 4.5, (s) => s.m.vx >= s.c.vx] },
    record: { xc: ["stop", (s) => s.c.x], xm: ["stop", (s) => s.m.x] },
  },
  order: ["pass1", "brake", "sameV", "pass2", "stop"],
  answers: { sameV: [37.5 / 4.5, 1e-9], xc: [250, 1e-6], xm: [255, 1e-6] },
  parts: [
    { to: () => 15, pace: 0.4, caption: "השוטר יוצא ממנוחה. מה התאוצה של האופנוע, ומה המשמעות שלה?" },
    { from: () => 5, to: () => 15, pace: 0.4, caption: "מ-5 עד 15 שניות המכונית בולמת. מה התאוצה שלה לפי ציר x, ומה המשמעות של הסימן?" },
    { to: () => 15, pace: 0.4, caption: "מי לפני מי ברגע t = 15 s?" },
    { to: () => 15, pace: 0.4, caption: "כמה פעמים כלי הרכב חולפים זה על פני זה עד t = 15 s?" },
    { to: () => 15, pace: 0.4, caption: "איזו מהירות ממוצעת גדולה יותר עד t = 15 s, של האופנוע או של המכונית?" },
    { to: () => 15, pace: 0.4, hideClock: true, caption: "מתי המהירות של האופנוע שווה למהירות של המכונית?" },
  ],
  draw: (P, m, t, part) => {
    P.line(-10, 0, 268, 0, { tone: "soft", w: 3, dash: "14 10" });
    P.line(0, -12, 0, 24, { tone: "line", w: 2 }); P.circle(0, 28, 5, { fill: "ask" }); P.mono(0, -12, "0", { tone: "data", size: 11, dyPx: 14 });
    P.mono(30, -12, "30", { tone: "data", size: 11, dyPx: 14 });
    const s = m.state(t);
    P.cart(s.c.x, 0, { tone: "b2" });
    P.block(s.m.x, 18, { wPx: 24, hPx: 16, tone: "runner", label: "M" });
    P.arrowPx(s.c.x, -16, s.c.vx * 2, 0, { tone: "vel" });
    P.arrowPx(s.m.x, 34, s.m.vx * 2, 0, { tone: "vel" });
    if (part === 0) askLabel(P, s.m.x, 18, "a = ?", -20, -34);
    if (part === 1 && t >= 5) askLabel(P, s.c.x, 0, "a = ?", -20, 40);
    if (part === 2 && t >= 15 - 1e-9) askLabel(P, 250, 0, "מי לפני מי?", -40, -60);
    if (part === 5) askLabel(P, 130, 40, "v₁ = v₂ ?", 0, 0);
  },
});
