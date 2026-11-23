import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1981c q7: a closed wagon with a pendulum from the ceiling and a hydrogen balloon tied to the floor gets a constant
 * acceleration to the right. The question asks for the new equilibrium, so the pendulum and the balloon are drawn
 * as at rest (pale) with a question mark; the wagon's motion is what is shown.
 */
const a = 2.5;
export const spec = storySpec({
  id: "bagrut-1981c-q7",
  view: { x0: -1, x1: 11, y0: -0.6, y1: 5.4 },
  scale: 10,
  story: {
    init: { w: body(0, 0, 0, 0) },
    phases: [{ end: "end", acc: { w: [a, 0] }, dur: () => 2, force: () => ({ w: [a, 0] }), until: (_s, t) => t >= 2 - 1e-12 }],
    record: { x: ["end", (s) => s.w.x] },
  },
  order: ["end"],
  answers: { x: [5, 1e-9] },
  parts: [{ to: (m) => m.events.end, pace: 1.2, caption: "הקרון מקבל תאוצה קבועה ימינה. מה מצב שיווי המשקל החדש של המטוטלת ושל הבלון?" }],
  draw: (P, m, t) => {
    P.ground(0, -0.8, 10.8);
    const s = m.state(t).w, x = s.x;
    P.poly([[x, 0.5], [x + 3, 0.5], [x + 3, 3.2], [x, 3.2]]);
    P.circle(x + 0.6, 0.25, 7, { fill: "none", tone: "line" }); P.circle(x + 2.4, 0.25, 7, { fill: "none", tone: "line" });
    // pendulum and balloon, drawn as at rest: the new angles are what is asked
    P.line(x + 1.5, 3.2, x + 1.5, 2.3, { tone: "idle", w: 1.4 }); P.circle(x + 1.5, 2.2, 6, { fill: "idle" });
    P.line(x + 1.5, 0.5, x + 1.5, 1.3, { tone: "idle", w: 1.4 }); P.circle(x + 1.5, 1.45, 7, { fill: "none", tone: "idle" });
    askLabel(P, x + 1.5, 2.2, "?", 14, 0);
    askLabel(P, x + 1.5, 1.45, "?", 14, 0);
    P.arrowPx(x + 1.5, 4.1, 50, 0, { tone: "force", label: "a" });
    if (s.vx > 0.05) P.arrowPx(x + 1.5, 4.8, s.vx * 9, 0, { tone: "vel", label: "v" });
  },
});
