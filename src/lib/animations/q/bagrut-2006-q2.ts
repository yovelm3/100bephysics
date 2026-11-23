import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2006 q2: a weight hangs from the car's roof; the string stays at α = 30° from the vertical, so the car accelerates
 * at g·tan 30° (to the right, the string tilts back). Part ד: twice that acceleration (the angle is asked, drawn pale).
 */
const g = 10, al = Math.PI / 6, a = g * Math.tan(al);
const car = (acc: number) => ({ init: { c: body(0, 0, 0, 0) }, phases: [{ end: "end", acc: { c: [acc, 0] as [number, number] }, dur: () => 1.4, force: () => ({ c: [acc, 0] as [number, number] }), until: (_s: unknown, t: number) => t >= 1.4 - 1e-12 }] });
export const spec = storySpec({
  id: "bagrut-2006-q2",
  view: { x0: -1, x1: 17, y0: -0.6, y1: 8.4 },
  scale: 16,
  scenarios: { base: car(a), twice: car(2 * a) },
  order: { base: ["end"], twice: ["end"] },
  answers: {},
  parts: [
    { to: () => 1.4, pace: 1.3, caption: "החוט נטוי בזווית קבועה של 30°. אילו כוחות פועלים על המשקולת?" },
    { to: () => 1.4, pace: 1.3, caption: "מה הכיוון של הכוח השקול על המשקולת?" },
    { to: () => 1.4, pace: 1.3, caption: "מה התאוצה של המכונית, בגודל ובכיוון?" },
    { to: () => 1.4, pace: 1.3, caption: "אילו התאוצה הייתה פי שניים, מה הייתה הזווית α?" },
    { to: () => 1.4, pace: 1.3, caption: "האם ייתכן שהמכונית נוסעת שמאלה?" },
    { to: () => 1.4, pace: 1.3, caption: "האם הזווית α תלויה במסת המשקולת?" },
  ],
  draw: (P, m, t, part) => {
    const s = m.state(t)[part === 3 ? "twice.c" : "base.c"];
    const x = s.x;
    P.ground(0, -0.8, 16.8);
    P.poly([[x, 0.6], [x + 3.4, 0.6], [x + 3.4, 3.2], [x, 3.2]], { fill: "none" });
    P.circle(x + 0.7, 0.3, 8, { fill: "line" }); P.circle(x + 2.7, 0.3, 8, { fill: "line" });
    const top: [number, number] = [x + 1.7, 3.2], L = 1.7;
    const ang = part === 3 ? 0 : -al;
    const bob: [number, number] = [top[0] + L * Math.sin(ang), top[1] - L * Math.cos(ang)];
    P.line(top[0], top[1], bob[0], bob[1], { tone: part === 3 ? "idle" : "line", w: 1.6 });
    P.ball(bob[0], bob[1] - 0.14, { rPx: 8, tone: part === 3 ? "idle" : "body" });
    if (part !== 3) { P.line(top[0], top[1], top[0], top[1] - 1.4, { tone: "idle", w: 1, dash: "3 3" }); P.mono(top[0] - 0.2, top[1] - 1.0, "30°", { tone: "data", size: 11, anchor: "end" }); }
    if (Math.abs(s.vx) > 0.05) P.arrowPx(x + 1.7, 4.2, s.vx * 6, 0, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, bob[0], bob[1], "?", 18, 0);
    if (part === 1) askLabel(P, bob[0], bob[1], "ΣF ?", 18, 0);
    if (part === 2) askLabel(P, x + 1.7, 4.2, "a = ?", -30, -30);
    if (part === 3) { P.mono(x + 1.7, 5, "2a", { tone: "data", size: 12 }); askLabel(P, bob[0], bob[1], "α = ?", 18, 0); }
    if (part === 4) askLabel(P, x + 1.7, 4.2, "← ?", -40, -30);
    if (part === 5) askLabel(P, bob[0], bob[1], "α(m) ?", 18, 0);
  },
});
