import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2001 q3: A (two boxes) on a table with friction, tied over a pulley to B (one box). The table gives A's speed every
 * 0.02 s; the trend is a = 2 m/s², so μ = 0.2 (box mass 1 kg drawn). At 0.1 s the string breaks; A slows at μg.
 * The motion is about 1 cm, so the scene is drawn in centimeters (world units: meters).
 */
const g = 10, mA = 2, mB = 1, mu = 0.2, tB = 0.1;
const a = (mB * g - mu * mA * g) / (mA + mB);
const T = [0, 0.02, 0.04, 0.06, 0.08, 0.1], V = [0, 0.038, 0.083, 0.123, 0.158, 0.2];
export const spec = storySpec({
  id: "bagrut-2001-q3",
  view: { x0: -0.035, x1: 0.033, y0: -0.026, y1: 0.008 },
  scale: 0.02,
  story: {
    init: { A: body(-0.026, 0, 0, 0), B: body(0.026, -0.01, 0, 0) },
    phases: [
      // build 2: each body with the tension T (A: T − μ·mA·g = mA·a; B: mB·g − T = mB·a)
      { end: "break", acc: { A: [a, 0], B: [0, -a] }, dur: () => tB, force: () => { const Tn = (mA * mB * g * (1 + mu)) / (mA + mB); return { A: [(Tn - mu * mA * g) / mA, 0], B: [0, -(mB * g - Tn) / mB] }; }, until: (_s, t) => t >= tB - 1e-12 },
      { end: "stop", acc: { A: [-mu * g, 0], B: [0, -g] }, dur: (s) => s.A.vx / (mu * g), force: () => ({ A: [-mu * g, 0], B: [0, -g] }), until: (s) => s.A.vx <= 0, jump: (s) => { s.A.vx = 0; } },
    ],
    record: { vBreak: ["break", (s) => s.A.vx] },
  },
  order: ["break", "stop"],
  answers: { vBreak: [0.2, 1e-9], stop: [0.2, 1e-9] },
  parts: [
    { to: () => tB, pace: 25, caption: "המהירות של A נמדדה כל 0.02 שניות. איך נראה גרף המהירות כפונקציה של הזמן?" },
    { to: () => tB, pace: 25, caption: "מה גודל התאוצה של A?" },
    { to: () => tB, pace: 25, caption: "מה מקדם החיכוך בין A לשולחן?" },
    { to: (m) => m.events.stop, pace: 25, hideClock: true, caption: "ב-0.1 s החוט נקרע. האם הזמן עד ש-A נעצר גדול מ-0.1 s, קטן ממנו או שווה לו?" },
  ],
  draw: (P, m, t, part) => {
    P.poly([[-0.034, 0], [0.022, 0], [0.022, -0.002], [-0.034, -0.002]]);
    P.pulley(0.0235, 0.0015, 10);
    const s = m.state(t), broken = t >= tB - 1e-9;
    P.block(s.A.x, 0, { wPx: 70, hPx: 30, label: "A" });
    if (!broken) {
      P.line(s.A.x + 0.0035, 0.0015, 0.0235, 0.0015, { tone: "line", w: 1.4 });
      P.line(0.0263, 0.0015, 0.0263, s.B.y + 0.002, { tone: "line", w: 1.4 });
    }
    P.block(0.0263, s.B.y, { wPx: 34, hPx: 28, base: false, label: "B", tone: "b2" });
    if (s.A.vx > 1e-4) P.arrowPx(s.A.x, 0.0065, s.A.vx * 250, 0, { tone: "vel", label: "v" });
    // the measurement table
    P.textPx(60, 268, "t (s)", { tone: "text", size: 11 });
    P.textPx(60, 296, "v (m/s)", { tone: "text", size: 11 });
    T.forEach((tt, i) => {
      const tone = tt <= t + 1e-9 ? "data" : "idle";
      P.textPx(140 + i * 80, 268, String(tt), { tone, size: 11 });
      P.textPx(140 + i * 80, 296, V[i].toFixed(3), { tone, size: 11 });
    });
    if (part === 0) askLabel(P, s.A.x, 0, "v(t) ?", 0, -60);
    if (part === 1) askLabel(P, s.A.x, 0, "a = ?", 0, -60);
    if (part === 2) askLabel(P, s.A.x, 0, "μ = ?", 0, -60);
    if (part === 3 && broken) askLabel(P, s.A.x, 0, "t ? 0.1 s", 0, -60);
  },
});
