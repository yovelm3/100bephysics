import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 2002 q1: a car at 108 km/h is 87.5 m ahead when the police motorcycle starts from rest at 4 m/s² (t = 0). */
const vc = 30, a = 4, d = 87.5;
export const spec = storySpec({
  id: "bagrut-2002-q1",
  view: { x0: -40, x1: 700, y0: -60, y1: 120 },
  scale: 700,
  story: {
    init: { m: body(0, 0, 0, 0), c: body(d, 0, vc, 0) },
    phases: [{
      end: "catch",
      acc: { m: [a, 0], c: [0, 0] },
      dur: () => (vc + Math.sqrt(vc * vc + 2 * a * d)) / a,
      force: () => ({ m: [a, 0], c: [0, 0] }),
      until: (s) => s.m.x >= s.c.x,
    }],
    marks: { sameSpeed: [() => vc / a, (s) => s.m.vx >= vc] },
    record: { xCatch: ["catch", (s) => s.m.x] },
  },
  order: ["sameSpeed", "catch"],
  answers: { catch: [17.5, 1e-9] },
  parts: [
    { to: (m) => m.events.catch, pace: 0.35, caption: "השוטר יוצא ממנוחה ומאיץ באופן קבוע. מה המשמעות של תאוצה של ארבעה מטר לשנייה בכל שנייה?" },
    { to: (m) => m.events.catch, pace: 0.35, caption: "בחרו ציר מקום: איפה הראשית ומה הכיוון החיובי. איפה נמצא האופנוע בכל רגע?" },
    { to: (m) => m.events.catch, pace: 0.35, caption: "איפה נמצאת המכונית בכל רגע, לפי אותו ציר?" },
    { to: (m) => m.events.catch, pace: 0.35, hideClock: true, caption: "השוטר מתקרב למכונית. אחרי כמה זמן הוא משיג אותה?" },
    { to: (m) => m.events.catch, pace: 0.35, caption: "איך משתנות המהירויות של המכונית ושל האופנוע עד רגע ההשגה?" },
  ],
  draw: (P, m, t, part) => {
    P.line(-40, 0, 700, 0, { tone: "soft", w: 3, dash: "14 10" });
    const s = m.state(t);
    P.block(s.m.x, 0, { wPx: 26, hPx: 18, tone: "runner", label: "M" });
    P.cart(s.c.x, 0, { wPx: 40, tone: "b2" });
    if (t < 0.6) P.dim(0, 0, d, 0, "87.5 m", { offPx: 30 });
    P.arrowPx(s.c.x, 30, 30, 0, { tone: "data", label: "108 km/h" });
    if (part === 0 || part === 4) P.arrowPx(s.m.x, 30, Math.min(60, s.m.vx * 1.6), 0, { tone: "vel", label: "v" });
    if (part === 1) askLabel(P, s.m.x, 0, "x(t) = ?", -30, 40);
    if (part === 2) askLabel(P, s.c.x, 0, "x(t) = ?", -30, 40);
    if (part === 3 && t >= m.events.catch - 1e-9) askLabel(P, s.c.x, 0, "t = ?", -20, -40);
    if (part === 4) askLabel(P, s.m.x, 0, "v(t) ?", -20, -60);
  },
});
