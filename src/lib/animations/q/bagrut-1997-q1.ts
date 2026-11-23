import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1997 q1: 0.4 kg on a smooth 30° slope; at t = 0 it moves 12 m/s down the slope and F = 3.6 N starts to push it up the
 * slope until t = 5 s. The axis x points down the slope, from the place at t = 0. The model's x is that axis.
 */
const g = 10, m = 0.4, F = 3.6, gs = g * Math.sin(Math.PI / 6), th = Math.PI / 6;
const aF = gs - F / m; // with F: −4 m/s² (up the slope)
export const spec = storySpec({
  id: "bagrut-1997-q1",
  view: { x0: -21, x1: 7, y0: -11.5, y1: 3.2 },
  scale: 20,
  story: {
    init: { b: body(0, 0, 12, 0) },
    phases: [
      { end: "turn", acc: { b: [aF, 0] }, dur: (s) => s.b.vx / -aF, force: () => ({ b: [(m * g * Math.sin(th) - F) / m, 0] }), until: (s) => s.b.vx <= 0 },
      { end: "Foff", acc: { b: [aF, 0] }, dur: (_s, t0) => 5 - t0, force: () => ({ b: [(m * g * Math.sin(th) - F) / m, 0] }), until: (_s, t) => t >= 5 - 1e-12 },
      { end: "top", acc: { b: [gs, 0] }, dur: (s) => -s.b.vx / gs, force: () => ({ b: [(m * g * Math.sin(th)) / m, 0] }), until: (s) => s.b.vx >= 0 },
      { end: "end", acc: { b: [gs, 0] }, dur: () => 1.2, force: () => ({ b: [(m * g * Math.sin(th)) / m, 0] }), until: (_s, t, t0) => t - t0 >= 1.2 - 1e-12 },
    ],
    record: { v5: ["Foff", (s) => s.b.vx], x5: ["Foff", (s) => s.b.x], xTurn: ["turn", (s) => s.b.x] },
  },
  order: ["turn", "Foff", "top", "end"],
  answers: { v5: [-8, 1e-9], x5: [10, 1e-9], turn: [3, 1e-9] },
  parts: [
    { to: () => 5, pace: 0.8, caption: "הגוף מחליק במורד ב-12 m/s, והכוח F דוחף אותו במעלה עד t = 5 s. מה המהירות שלו אז, בגודל ובכיוון?" },
    { to: () => 5, pace: 0.8, caption: "איך נראה גרף המהירות מ-0 עד 5 שניות?" },
    { to: () => 5, pace: 0.8, caption: "איפה נמצא הגוף ברגע t = 5 s?" },
    { from: () => 5, to: (mm) => mm.events.end, pace: 0.8, caption: "הכוח מפסיק לפעול. איך נע הגוף מעכשיו?" },
  ],
  draw: (P, mm, t, part) => {
    // the slope rises to the right; x (down the slope) goes to the lower left
    const c = Math.cos(th), sn = Math.sin(th);
    const at = (x: number): [number, number] => [-x * c, -x * sn];
    const [x1, y1] = at(22), [x2, y2] = at(-6);
    P.poly([[x1, y1], [x2, y2], [x2, y1]]);
    P.line(at(0)[0], at(0)[1], at(0)[0], at(0)[1] + 0.9, { tone: "data", w: 1.2 });
    P.mono(at(0)[0], at(0)[1] + 0.9, "x = 0", { tone: "data", size: 11, dyPx: -6 });
    P.arrow(at(0)[0] + 0.8, at(0)[1] + 1.8, at(3)[0] + 0.8, at(3)[1] + 1.8, { tone: "data", w: 1.4, label: "x" });
    const s = mm.state(t).b;
    const [bx, by] = at(s.x);
    P.block(bx, by, { wPx: 28, hPx: 18, angle: th });
    if (t < 5) { const [fx, fy] = [c * 50, -sn * 50]; P.arrowPx(bx, by + 0.6, fx, fy, { tone: "force", label: "F" }); }
    if (Math.abs(s.vx) > 0.05) P.arrowPx(bx, by + 1.5, -s.vx * c * 4, s.vx * sn * 4, { tone: "vel", label: "v" });
    if (part === 0 && t >= 5 - 1e-9) askLabel(P, bx, by, "v = ?", 0, 50);
    if (part === 1) askLabel(P, bx, by, "v(t) ?", 0, 50);
    if (part === 2 && t >= 5 - 1e-9) askLabel(P, bx, by, "x = ?", 0, 50);
    if (part === 3) askLabel(P, bx, by, "?", 0, 50);
  },
});
