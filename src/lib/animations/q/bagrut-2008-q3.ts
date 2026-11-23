import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2008 q3: bodies 1 and 2 on string b over a pulley hung on string c. F1 pushes body 1 down for 6 s: the graph rises
 * to 30 m/s at 6 s and stays (so m2 = m1 = 0.5 kg, a = 5 m/s², F1 = 5 N). The motion is drawn at 0.6:100 scale.
 * Part ה: a body of weight F1 glued to body 1 instead of the force.
 */
const g = 10, m1 = 0.5, m2 = 0.5, F1 = 5, k = 0.006;
const pushed = (mass1: number, extraF: number) => {
  const a = (extraF + (mass1 - m2) * g) / (mass1 + m2);
  return {
    init: { b1: body(0, 0, 0, 0), b2: body(0, 0, 0, 0) },
    phases: [
      // build 2: body 1: F + m1·g − T = m1·a ; body 2: T − m2·g = m2·a (down positive for body 1)
      { end: "off", acc: { b1: [0, a] as [number, number], b2: [0, -a] as [number, number] }, dur: () => 6, force: () => { const T = (m2 * (extraF + mass1 * g) + mass1 * m2 * g) / (mass1 + m2); return { b1: [0, (extraF + mass1 * g - T) / mass1] as [number, number], b2: [0, -(T - m2 * g) / m2] as [number, number] }; }, until: (_s: unknown, t: number) => t >= 6 - 1e-12 },
      { end: "end", acc: {}, dur: () => 6, force: () => ({}), until: (_s: unknown, t: number) => t >= 12 - 1e-12 },
    ],
    record: { v6: ["off", (s: Record<string, { vy: number }>) => s.b1.vy] as [string, (s: never) => number] },
  };
};
export const spec = storySpec({
  id: "bagrut-2008-q3",
  view: { x0: -3, x1: 3, y0: -0.2, y1: 2.8 },
  scale: 3,
  scenarios: { force: pushed(m1, F1) as never, glued: pushed(m1 + F1 / g, 0) as never },
  order: { force: ["off", "end"], glued: ["off", "end"] },
  answers: { "force.v6": [30, 1e-9] },
  parts: [
    { to: () => 12, pace: 0.4, caption: "F1 דוחף את גוף 1 כלפי מטה 6 שניות, ואז המהירות נשארת קבועה. מה המסה של גוף 2?" },
    { to: () => 6, pace: 0.4, caption: "מה גודל הכוח F1?" },
    { to: () => 6, pace: 0.4, caption: "מה המתיחות בחוט b בשש השניות הראשונות?" },
    { to: () => 6, pace: 0.4, caption: "מה המתיחות בחוט c, שמחזיק את הגלגלת?" },
    { to: () => 12, pace: 0.4, caption: "במקום הכוח מדביקים לגוף 1 גוף שמשקלו F1, ואחרי 6 שניות הוא מתנתק. האם גרף המהירות זהה?" },
  ],
  draw: (P, m, t, part) => {
    const key = part === 4 ? "glued" : "force";
    const s = m.state(t), b1 = s[`${key}.b1`], b2 = s[`${key}.b2`];
    // the question's graph of body 1 (down positive)
    const G = P.graph({ xPx: 40, yPx: 30, wPx: 190, hPx: 130, tMax: 13, vMin: 0, vMax: 35, xLabel: "t (s)", yLabel: "v (m/s)" });
    P.path([[G.gx(0), G.gy(0)], [G.gx(6), G.gy(30)], [G.gx(12), G.gy(30)]], { tone: "body", w: 2.2 });
    P.textPx(G.gx(6), G.gy(0) + 13, "6", { tone: "data", size: 10 }); P.textPx(G.gx(12), G.gy(0) + 13, "12", { tone: "data", size: 10 });
    P.textPx(36, G.gy(30) + 4, "30", { tone: "data", size: 10, anchor: "end" });
    const Y1 = 2.1 - k * b1.y, Y2 = 0.4 - k * b2.y; // body 1: down positive
    P.line(0.4, 2.75, 1.6, 2.75, { tone: "line", w: 3 });
    P.line(1, 2.75, 1, 2.55, { tone: "line", w: 1.4 }); P.mono(1.07, 2.65, "c", { tone: "data", size: 10, anchor: "start" });
    P.pulley(1, 2.45, 16);
    P.line(0.78, 2.45, 0.78, Y1 + 0.1, { tone: "line", w: 1.4 }); P.mono(0.7, 2.2, "b", { tone: "data", size: 10, anchor: "end" });
    P.line(1.22, 2.45, 1.22, Y2 + 0.1, { tone: "line", w: 1.4 });
    P.block(0.78, Y1, { wPx: 26, hPx: 22, base: false, label: "1" });
    if (part === 4 && t < 6) P.block(0.78, Y1 - 0.15, { wPx: 26, hPx: 14, base: false, tone: "runner" });
    P.block(1.22, Y2, { wPx: 26, hPx: 22, base: false, label: "2", tone: "b2" });
    if (part !== 4 && t < 6) P.arrowPx(0.55, Y1, 0, 34, { tone: "force", label: "F₁" });
    P.ground(0, -0.5, 2.6);
    if (part === 0) askLabel(P, 1.22, Y2, "m₂ = ?", 26, 0);
    if (part === 1) askLabel(P, 0.55, Y1, "F₁ = ?", -60, 20);
    if (part === 2) askLabel(P, 1.22, 1.6, "T(b) = ?", 26, 0);
    if (part === 3) askLabel(P, 1, 2.65, "T(c) = ?", 30, 0);
    if (part === 4) askLabel(P, 0.78, Y1, "v(t) ?", -70, 0);
  },
});
