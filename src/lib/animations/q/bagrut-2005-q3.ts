import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2005 q3: a rope over a pulley; Rami (70 kg) stands on the floor holding one end, Yael (60 kg) hangs at rest on the other.
 * From t = 1 s Yael climbs with 0.25 m/s² (relative to the floor); Rami stays at rest. The rope does not move.
 */
const g = 10, mR = 70, mY = 60, aY = 0.25;
export const spec = storySpec({
  id: "bagrut-2005-q3",
  view: { x0: -3, x1: 3, y0: -0.3, y1: 2.7 },
  scale: 3,
  story: {
    init: { y: body(0.45, 0.6, 0, 0) },
    phases: [
      { end: "climb", acc: {}, dur: () => 1, force: () => ({}), until: (_s, t) => t >= 1 - 1e-12 },
      // build 2: Yael's forces: the rope's pull T (from her own hands) minus her weight
      { end: "end", acc: { y: [0, aY] }, dur: () => 2, force: () => { const T = mY * (g + aY); return { y: [0, (T - mY * g) / mY] }; }, until: (_s, t) => t >= 3 - 1e-12 },
    ],
    record: { T: ["end", (s) => mY * (g + (s.y.vy / 2))], N: ["climb", () => mR * g - mY * g] },
  },
  order: ["climb", "end"],
  answers: { T: [615, 1e-9], N: [100, 1e-9] },
  parts: [
    { to: () => 1, pace: 1, caption: "רמי עומד ואוחז בחבל, ויעל תלויה במנוחה. אילו כוחות פועלים על כל אחד מהם?" },
    { to: () => 1, pace: 1, caption: "מה הכוח שהרצפה מפעילה על רמי?" },
    { to: () => 3, pace: 1, caption: "יעל מטפסת בתאוצה קבועה, ורמי נשאר על הרצפה. האם הכוח של הרצפה על רמי גדל, קטן או נשאר?" },
    { to: () => 3, pace: 1, caption: "מה המתיחות בחבל בזמן שיעל מטפסת?" },
    { to: () => 3, pace: 1, caption: "מה התאוצה הקטנה ביותר שבה יעל צריכה לטפס כדי שרמי יתרומם?" },
  ],
  draw: (P, m, t, part) => {
    const s = m.state(t).y;
    P.ground(0, -2.8, 2.8);
    P.line(-1, 2.55, 1, 2.55, { tone: "line", w: 3 });
    P.line(0, 2.55, 0, 2.42, { tone: "line", w: 1.4 });
    P.pulley(0, 2.3, 20);
    P.line(-0.45, 2.3, -0.45, 0.42, { tone: "line", w: 1.4 });
    P.line(0.45, 2.3, 0.45, 0.4, { tone: "line", w: 1.4 });
    P.person(-0.6, 0, t, { tone: "runner", facing: 1 });
    P.heb(-0.9, 0, "רמי", { tone: "runner", size: 11, dyPx: 14 });
    P.circle(0.45, s.y + 0.36, 6, { fill: "b2" });
    P.line(0.45, s.y + 0.3, 0.45, s.y, { tone: "b2", w: 4 });
    P.heb(0.8, s.y + 0.2, "יעל", { tone: "b2", size: 11 });
    if (s.vy > 0.01) P.arrowPx(0.75, s.y, 0, -s.vy * 60, { tone: "vel", label: "v" });
    if (part === 0) { askLabel(P, -0.6, 0.3, "?", -30, 0); askLabel(P, 0.45, s.y, "?", 40, 0); }
    if (part === 1 || part === 2) askLabel(P, -0.6, 0, "N = ?", -50, -10);
    if (part === 3 && t >= 1) askLabel(P, 0.45, 1.6, "T = ?", 20, 0);
    if (part === 4 && t >= 1) askLabel(P, 0.45, s.y, "a min = ?", 40, -20);
  },
});
