import { body } from "../engine";
import { joinSpecs, askLabel, storySpec } from "../kits";
import { radialSpec } from "./_space";

/**
 * 1996 q5: a rocket goes straight up from rest at a constant 20 m/s² for 5 minutes (900 km, 6000 m/s); then it coasts up
 * to 4452 km above the surface. g = 9.8 m/s², R = 6400 km. Two stories: the burn and the coasting.
 */
const R = 6.4e6, gm = 9.8 * R * R, a = 20, tb = 300;
const burn = storySpec({
  id: "bagrut-1996-q5",
  view: { x0: -5.5e6, x1: 5.5e6, y0: -6e5, y1: 5e6 },
  scale: 9e5,
  story: { init: { r: body(0, 0, 0, 0) }, phases: [{ end: "out", acc: { r: [0, a] }, dur: () => tb, force: () => ({ r: [0, a] }), until: (_s, t) => t >= tb - 1e-9 }], record: { h: ["out", (s) => s.r.y], v: ["out", (s) => s.r.vy] } },
  order: ["out"],
  answers: { h: [9e5, 1e-6], v: [6000, 1e-9] },
  parts: [
    { to: () => tb, pace: 0.02, hideClock: false, caption: "הטיל עולה בתאוצה קבועה של 20 m/s² חמש דקות. באיזה גובה נגמר הדלק?" },
    { to: () => tb, pace: 0.02, caption: "מה תאוצת הנפילה החופשית בגובה הזה?" },
    { to: () => tb, pace: 0.02, caption: "בטיל תלוי מד כוח עם גוף של 2 ק\"ג. מה הוא מראה רגע לפני שנגמר הדלק?" },
  ],
  draw: (P, m, t, part) => {
    P.poly(Array.from({ length: 81 }, (_, i) => { const q = Math.PI / 2 + ((i - 40) / 40) * 0.9; return [R * Math.cos(q), R * Math.sin(q) - R] as [number, number]; }), { close: false, fill: "none", tone: "b2", w: 3 });
    const y = m.state(t).r.y;
    P.poly([[-6e4, y], [6e4, y], [0, y + 2.4e5]], { tone: "body", fill: "body" });
    P.arrowPx(0, y, 0, 26, { tone: "force" });
    if (part === 0 && t >= tb - 1e-9) askLabel(P, 0, y, "h = ?", 20, 0);
    if (part === 1 && t >= tb - 1e-9) askLabel(P, 0, y, "g = ?", 20, 0);
    if (part === 2) askLabel(P, 0, y, "F = ?", 20, 0);
  },
});
const coast = radialSpec({
  id: "bagrut-1996-q5", R, gm, r0: R + 9e5, v0: 6000, r1: R + 4.452561405587982e6 * 0.995,
  parts: [
    { caption: "הדלק נגמר. לאיזה גובה מרבי עולה הטיל?", ask: "h max = ?" },
    { caption: "מה מראה מד הכוח רגע אחרי שנגמר הדלק?", ask: "F = ?", until: 0.05 },
  ],
});
export const spec = joinSpecs("bagrut-1996-q5", [{ key: "burn", spec: burn, parts: [0, 1, 2] }, { key: "coast", spec: coast, parts: [0, 1] }], [["burn", 0], ["burn", 1], ["coast", 0], ["burn", 2], ["coast", 1]]);
