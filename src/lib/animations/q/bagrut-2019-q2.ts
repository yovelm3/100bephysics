import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2019 q2: m1 = 0.5 kg on a smooth 30° slope, pulled up by m2 hanging over a pulley at the top. The sensor's table gives
 * a ≈ 3.74 m/s² (so T ≈ 4.37 N, m2 ≈ 0.70 kg). At 1 s the string breaks: m1 slows (−5 m/s² up the slope), m2 falls freely.
 * m1's x: distance up the slope; m2's y: up positive.
 */
const g = 10, m1 = 0.5, th = Math.PI / 6;
const T_ = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], V = [0.45, 0.7, 1.15, 1.5, 1.95, 2.25];
const tm = T_.reduce((a, b) => a + b) / 6, vm = V.reduce((a, b) => a + b) / 6;
const a = T_.reduce((acc, t, i) => acc + (t - tm) * (V[i] - vm), 0) / T_.reduce((acc, t) => acc + (t - tm) ** 2, 0);
const v0 = vm - a * tm; // the trend line's value at t = 0
const T = m1 * (g * Math.sin(th) + a), m2 = T / (g - a);
const gs = g * Math.sin(th);
export const spec = storySpec({
  id: "bagrut-2019-q2",
  view: { x0: -0.4, x1: 5.6, y0: -0.6, y1: 2.4 },
  scale: 5,
  story: {
    init: { b: body(0, 0, v0, 0), h: body(0, 0, 0, -v0) },
    phases: [
      // build 2: m1: T − m1·g·sin θ = m1·a ; m2: m2·g − T = m2·a (with the tension of the string)
      { end: "break", acc: { b: [a, 0], h: [0, -a] }, dur: () => 1, force: () => { const Tn = (m1 * m2 * (g + gs)) / (m1 + m2); return { b: [(Tn - m1 * gs) / m1, 0], h: [0, (Tn - m2 * g) / m2] }; }, until: (_s, t) => t >= 1 - 1e-12 },
      { end: "top", acc: { b: [-gs, 0], h: [0, -g] }, dur: (s) => s.b.vx / gs, force: () => ({ b: [-gs, 0], h: [0, -g] }), until: (s) => s.b.vx <= 0 },
    ],
    record: { aUp: ["break", (s) => (s.b.vx - v0) / 1], ratio: ["top", () => -gs / g] },
  },
  order: ["break", "top"],
  answers: { aUp: [3.7428571428571433, 0.01], ratio: [-0.5, 1e-9] },
  parts: [
    { to: () => 0.6, pace: 3, caption: "החיישן מודד את המהירות של m1 כל 0.1 שנייה. איך נראה גרף המהירות כפונקציה של הזמן?" },
    { to: () => 0.6, pace: 3, caption: "מה השיפוע של הגרף, ומה המשמעות שלו?" },
    { to: () => 1, pace: 3, caption: "מה משוואות הכוחות של כל אחד מהגופים?" },
    { to: () => 1, pace: 3, caption: "מה המתיחות בחוט בזמן התנועה?" },
    { from: () => 1, to: (m) => m.events.top, pace: 3, caption: "אחרי שנייה החוט נקרע. מה היחס בין התאוצות של m1 ו-m2?" },
    { from: () => 1, to: (m) => m.events.top, pace: 3, caption: "איזה גרף מתאר את המהירויות של שני הגופים מרגע הקריעה?" },
  ],
  draw: (P, mm, t, part) => {
    const L = 5.2, top: [number, number] = [L * Math.cos(th), L * Math.sin(th) - 0.4];
    const at = (x: number): [number, number] => [0.6 * Math.cos(th) + x * Math.cos(th), 0.6 * Math.sin(th) - 0.4 + x * Math.sin(th)];
    P.poly([[0, -0.4], top, [top[0], -0.4]]);
    P.pulley(top[0] + 0.05, top[1] + 0.08, 9);
    P.block(0.2 * Math.cos(th), 0.2 * Math.sin(th) - 0.4, { wPx: 12, hPx: 20, angle: th, tone: "line" });
    P.mono(0.2, -0.4, "Sx", { tone: "data", size: 10, dyPx: 16 });
    const s = mm.state(t), broken = t >= 1 - 1e-9;
    const [x, y] = at(s.b.x);
    P.block(x, y, { wPx: 26, hPx: 18, angle: th, label: "m₁" });
    if (!broken) P.line(x + 0.14 * Math.cos(th), y + 0.14 * Math.sin(th) + 0.06, top[0] + 0.05, top[1] + 0.16, { tone: "line", w: 1.3 });
    const hy = top[1] - 0.7 + s.h.y;
    if (!broken) P.line(top[0] + 0.16, top[1] + 0.08, top[0] + 0.16, hy + 0.1, { tone: "line", w: 1.3 });
    P.block(top[0] + 0.16, hy, { wPx: 22, hPx: 24, base: false, label: "m₂", tone: "b2" });
    T_.forEach((tt, i) => { const tone = tt <= t + 1e-9 ? "data" : "idle"; P.textPx(110 + i * 44, 40, String(tt), { tone, size: 11 }); P.textPx(110 + i * 44, 64, String(V[i]), { tone, size: 11 }); });
    P.textPx(84, 40, "t (s)", { tone: "text", size: 11, anchor: "end" });
    P.textPx(84, 64, "v (m/s)", { tone: "text", size: 11, anchor: "end" });
    if (part === 0) askLabel(P, x, y, "v(t) ?", 0, -40);
    if (part === 1) askLabel(P, x, y, "slope = ?", 0, -40);
    if (part === 2) { askLabel(P, x, y, "?", 0, -40); askLabel(P, top[0] + 0.16, hy, "?", -30, 0); }
    if (part === 3 && !broken) askLabel(P, (x + top[0]) / 2, (y + top[1]) / 2 + 0.15, "T = ?", 0, -20);
    if (part === 4) askLabel(P, x, y, "a₁ / a₂ = ?", 0, -40);
    if (part === 5) askLabel(P, x, y, "v(t) ?", 0, -40);
  },
});
