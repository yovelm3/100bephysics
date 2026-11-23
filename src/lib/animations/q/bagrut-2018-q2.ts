import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2018 q2: m1 on a smooth slope, tied over a pulley at the top to m2 hanging; F pushes m1 down the slope.
 * The table F = 20…60 N, a = 3…12.5 m/s². With m1 = m2 = m: a = F/(2m) + (sin α − 1)g/2, so the trend gives
 * m ≈ 2.16 kg and F0 ≈ 8 N (sin α ≈ 0.63). Each run: 0.5 s from rest. x: distance down the slope.
 */
const g = 10, F = [20, 30, 40, 50, 60], A_ = [3.0, 5.0, 7.4, 9.1, 12.5];
const fm = F.reduce((a, b) => a + b) / 5, am = A_.reduce((a, b) => a + b) / 5;
const slope = F.reduce((acc, f, i) => acc + (f - fm) * (A_[i] - am), 0) / F.reduce((acc, f) => acc + (f - fm) ** 2, 0);
const icpt = am - slope * fm, m = 1 / (2 * slope), F0 = -icpt / slope;
const sinA = 1 - F0 / (m * g), al = Math.asin(sinA);
const run = (f: number): Story => ({
  init: { b: body(0, 0, 0, 0), h: body(0, 0, 0, 0) },
  // build 2: m1: F + m·g·sin α − T = m·a ; m2: T − m·g = m·a
  phases: [{ end: "end", acc: { b: [(f + (m * sinA - m) * g) / (2 * m), 0], h: [0, (f + (m * sinA - m) * g) / (2 * m)] }, dur: () => 0.5, force: () => { const T = (f + m * g * sinA + m * g) / 2; return { b: [(f + m * g * sinA - T) / m, 0], h: [0, (T - m * g) / m] }; }, until: (_s, t) => t >= 0.5 - 1e-12 }],
  record: { a: ["end", (s) => s.b.vx / 0.5] },
});
const scen: Record<string, Story> = Object.fromEntries(F.map((f, i) => [`f${i}`, run(f)]));
scen.F0 = run(F0);
export const spec = storySpec({
  id: "bagrut-2018-q2",
  view: { x0: -0.4, x1: 3.6, y0: -0.45, y1: 1.75 },
  scale: 3,
  scenarios: scen,
  order: Object.fromEntries(Object.keys(scen).map((k) => [k, ["end"]])),
  answers: { "F0.a": [0, 1e-9] },
  parts: [
    { to: () => 0.5, pace: 4, caption: "F דוחף את m1 במורד, ו-m2 עולה. אילו כוחות פועלים על כל גוף?" },
    { to: () => 0.5, pace: 4, caption: "מה הביטוי הלינארי של התאוצה כפונקציה של F?" },
    { to: () => 0.5, pace: 4, caption: "בכל ניסוי כוח אחר, ומודדים את התאוצה. איך נראה הגרף של a כפונקציה של F?" },
    { to: () => 0.5, pace: 4, caption: "המסות שוות. מה המסה m, לפי הגרף?" },
    { to: () => 0.5, pace: 4, caption: "באיזה כוח F המערכת תנוע במהירות קבועה?" },
  ],
  draw: (P, mm, t, part) => {
    // the slope rises to the right; the pulley at the top; down the slope = to the lower left
    const L = 3, top: [number, number] = [L * Math.cos(al), L * Math.sin(al) - 0.4];
    const at = (x: number): [number, number] => [top[0] - (0.9 + x) * Math.cos(al), top[1] - (0.9 + x) * Math.sin(al)];
    P.poly([[0, -0.4], top, [top[0], -0.4]]);
    P.pulley(top[0] + 0.04, top[1] + 0.06, 9);
    const key = part === 4 ? "F0" : part === 3 ? "f2" : "f0";
    const s = mm.state(t), b = s[`${key}.b`], h = s[`${key}.h`];
    const [x, y] = at(b.x);
    P.block(x, y, { wPx: 26, hPx: 18, angle: al, label: "m₁" });
    P.line(x + 0.12 * Math.cos(al), y + 0.12 * Math.sin(al) + 0.05, top[0] + 0.04, top[1] + 0.13, { tone: "line", w: 1.3 });
    const hy = top[1] - 0.6 + h.y;
    P.line(top[0] + 0.14, top[1] + 0.06, top[0] + 0.14, hy + 0.08, { tone: "line", w: 1.3 });
    P.block(top[0] + 0.14, hy, { wPx: 22, hPx: 24, base: false, label: "m₂", tone: "b2" });
    const f = part === 4 ? F0 : F[part === 3 ? 2 : 0];
    P.arrowPx(x - 0.05, y + 0.05, -(16 + f) * Math.cos(al), (16 + f) * Math.sin(al), { tone: "force", label: "F" });
    F.forEach((ff, i) => { P.textPx(110 + i * 46, 40, String(ff), { tone: "data", size: 11 }); P.textPx(110 + i * 46, 64, String(A_[i]), { tone: "data", size: 11 }); });
    P.textPx(88, 40, "F (N)", { tone: "text", size: 11, anchor: "end" });
    P.textPx(88, 64, "a (m/s²)", { tone: "text", size: 11, anchor: "end" });
    if (part === 0) { askLabel(P, x, y, "?", 0, -40); askLabel(P, top[0] + 0.14, hy, "?", 26, 0); }
    if (part === 1) askLabel(P, 1.6, 1.2, "a(F) = ?", 0, 0);
    if (part === 2) askLabel(P, 1.6, 1.2, "a(F) ?", 0, 0);
    if (part === 3) askLabel(P, 1.6, 1.2, "m = ?", 0, 0);
    if (part === 4) askLabel(P, x, y, "F = ?", -40, -40);
  },
});
