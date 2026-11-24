import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1987 q3: a body on a slope (drawn α = 20°, μ = 0.2, m = 1 kg) pushed by a horizontal force F. F_min moves it up at
 * constant speed: F_min = mg(sin α + μ cos α)/(cos α − μ sin α). With F = 3F_min it accelerates up the slope.
 * The model's x is the distance up the slope.
 */
const g = 10, al = (20 * Math.PI) / 180, mu = 0.2, m = 1;
const Fmin = (m * g * (Math.sin(al) + mu * Math.cos(al))) / (Math.cos(al) - mu * Math.sin(al));
const F = 3 * Fmin;
const N = m * g * Math.cos(al) + F * Math.sin(al);
const a = (F * Math.cos(al) - m * g * Math.sin(al) - mu * N) / m;
export const spec = storySpec({
  id: "bagrut-1987-q3",
  view: { x0: -0.4, x1: 3.6, y0: -0.3, y1: 1.7 },
  scale: 3,
  story: {
    init: { b: body(0.3, 0, 0, 0) },
    // build 2: the force's and the weight's parts along the slope, and friction from the normal force
    phases: [{ end: "end", acc: { b: [a, 0] }, dur: () => 0.7, force: () => { const n = m * g * Math.cos(al) + F * Math.sin(al); return { b: [(F * Math.cos(al) - m * g * Math.sin(al) - mu * n) / m, 0] }; }, until: (_s, t) => t >= 0.7 - 1e-12 }],
    record: { a: ["end", (s) => s.b.vx / 0.7] },
  },
  order: ["end"],
  answers: { a: [a, 1e-9] },
  parts: [
    { to: () => 0.2, pace: 1, caption: "כוח אופקי F דוחף את הגוף. מה הכוח הקטן ביותר שבו אפשר לדחוף אותו במעלה? האם תמיד יש כוח כזה?" },
    { to: () => 0.7, pace: 1.5, caption: "F = 3Fmin. מה התאוצה של הגוף במעלה המדרון?" },
    { to: () => 0.7, pace: 1.5, caption: "הגוף עובר מרחק ℓ לאורך המדרון. מה העבודה של הכוח F?" },
  ],
  draw: (P, m_, t, part) => {
    const L = 3.6, top: [number, number] = [L * Math.cos(al), L * Math.sin(al)];
    P.poly([[0, 0], top, [top[0], 0]]);
    P.mono(0.5, 0, "α", { tone: "data", size: 12, dyPx: -4 });
    const s = m_.state(part === 0 ? 0 : t).b;
    const p: [number, number] = [s.x * Math.cos(al), s.x * Math.sin(al)];
    P.block(p[0], p[1], { wPx: 28, hPx: 20, angle: al });
    P.arrowPx(p[0] - 0.35, p[1] + 0.12, 34, 0, { tone: "force", label: "F" });
    if (s.vx > 0.02) P.arrowPx(p[0], p[1] + 0.35, s.vx * Math.cos(al) * 18, -s.vx * Math.sin(al) * 18, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, p[0] - 0.35, p[1] + 0.12, "Fmin = ?", -30, -20);
    if (part === 1) askLabel(P, p[0], p[1], "a = ?", 20, -40);
    if (part === 2 && t >= 0.7 - 1e-9) askLabel(P, p[0], p[1], "W(F) = ?", 20, -40);
  },
});
