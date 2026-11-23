import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2015 q2: the acceleration down a slope measured for μ = 0.10…0.30 (a = 2.5…0.6 m/s²). The trend line
 * a = g·sin α − μ·g·cos α gives α ≈ 20°. Each run: 1.2 s from rest. Five lanes across the slope.
 */
const g = 10, MU = [0.1, 0.15, 0.2, 0.25, 0.3], A_ = [2.5, 2.0, 1.6, 1.1, 0.6];
const mm = MU.reduce((a, b) => a + b) / 5, am = A_.reduce((a, b) => a + b) / 5;
const slope = MU.reduce((acc, u, i) => acc + (u - mm) * (A_[i] - am), 0) / MU.reduce((acc, u) => acc + (u - mm) ** 2, 0);
const al = Math.acos(-slope / g);
const L = 4;
const run = (mu: number): Story => ({
  init: { b: body(L, 0, 0, 0) },
  // x: distance along the slope from the bottom; build 2: weight along the slope and friction against the motion
  phases: [{ end: "end", acc: { b: [-(g * Math.sin(al) - mu * g * Math.cos(al)), 0] }, dur: () => 1.2, force: (s) => ({ b: [-g * Math.sin(al) + (s.b.vx < 0 ? mu * g * Math.cos(al) : 0), 0] }), until: (_s, t) => t >= 1.2 - 1e-12 }],
  record: { a: ["end", (s) => -s.b.vx / 1.2] },
});
const scen = Object.fromEntries(MU.map((u, i) => [`m${i}`, run(u)]));
export const spec = storySpec({
  id: "bagrut-2015-q2",
  view: { x0: -0.5, x1: 4.6, y0: -0.3, y1: 2.25 },
  scale: 4,
  scenarios: scen,
  order: Object.fromEntries(Object.keys(scen).map((k) => [k, ["end"]])),
  answers: { "m0.a": [g * Math.sin(al) - 0.1 * g * Math.cos(al), 1e-9] },
  parts: [
    { to: () => 1.2, pace: 1.5, caption: "אילו כוחות פועלים על הגוף כשהוא נע במורד?" },
    { to: () => 1.2, pace: 1.5, caption: "מה הביטוי לתאוצה כפונקציה של מקדם החיכוך?" },
    { to: () => 1.2, pace: 1.5, caption: "בכל ניסוי מקדם חיכוך אחר. איך נראה גרף התאוצה כפונקציה של μ?" },
    { to: () => 1.2, pace: 1.5, caption: "מה המשמעות של נקודות החיתוך של הגרף עם הצירים?" },
    { to: () => 1.2, pace: 1.5, caption: "מה זווית השיפוע α של המדרון?" },
  ],
  draw: (P, m, t, part) => {
    const at = (x: number): [number, number] => [x * Math.cos(al), x * Math.sin(al)];
    const top = at(L + 0.3);
    P.poly([[0, 0], top, [top[0], 0]]);
    P.mono(0.7, 0, "α", { tone: "data", size: 12, dyPx: -5 });
    MU.forEach((u, i) => {
      const b = m.state(t)[`m${i}.b`];
      const [x, y] = at(b.x);
      P.block(x, y, { wPx: 20, hPx: 14, angle: al, label: String(i + 1) });
      P.textPx(130 + i * 44, 40, String(u), { tone: "data", size: 11 });
      P.textPx(130 + i * 44, 64, String(A_[i]), { tone: "data", size: 11 });
    });
    P.textPx(108, 40, "μ", { tone: "text", size: 11, anchor: "end" });
    P.textPx(108, 64, "a (m/s²)", { tone: "text", size: 11, anchor: "end" });
    const [x, y] = at(m.state(t)["m0.b"].x);
    if (part === 0) askLabel(P, x, y, "?", 20, -40);
    if (part === 1) askLabel(P, x, y, "a(μ) = ?", 20, -40);
    if (part === 2) askLabel(P, 2.6, 2, "a(μ) ?", 0, 0);
    if (part === 3) askLabel(P, 2.6, 2, "?", 0, 0);
    if (part === 4) askLabel(P, 0.7, 0, "α = ?", 30, -24);
  },
});
