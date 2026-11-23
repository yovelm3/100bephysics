import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2010 q1: cart M0 on a smooth rail, tied over a pulley to a 100 g basket; six 300 g weights start in the cart, and one
 * moves to the basket before each measurement. The trend of the measured a against Fg gives M0 ≈ 0.504 kg.
 * Each measurement is shown for 0.4 s. The cart is drawn moving; the basket drops as far (at 1/2 scale).
 */
const g = 10, m0 = 0.1, m1 = 0.3, M0 = 0.5043966109457292;
const total = M0 + m0 + 6 * m1;
const measured = [0.43, 1.66, 2.91, 4.16, 5.4, 6.67];
const run = (k: number): Story => {
  const hang = m0 + k * m1;
  return {
    init: { c: body(0, 0, 0, 0), b: body(0, 0, 0, 0) },
    phases: [{
      end: "end",
      acc: { c: [(hang * g) / total, 0], b: [0, -(hang * g) / total] },
      dur: () => 0.4,
      // build 2: the cart pulled by T; the basket: its weight minus T
      force: () => { const T = ((total - hang) * hang * g) / total; return { c: [T / (total - hang), 0], b: [0, -(hang * g - T) / hang] }; },
      until: (_s, t) => t >= 0.4 - 1e-12,
    }],
    record: { a: ["end", (s) => s.c.vx / 0.4] },
  };
};
const scen = Object.fromEntries([0, 1, 2, 3, 4, 5].map((k) => [`k${k}`, run(k)]));
export const spec = storySpec({
  id: "bagrut-2010-q1",
  view: { x0: -0.1, x1: 1.5, y0: -0.62, y1: 0.18 },
  scale: 1,
  scenarios: scen,
  order: Object.fromEntries(Object.keys(scen).map((k) => [k, ["end"]])),
  // the trend line reproduces the measurements to about 0.05 m/s²
  answers: Object.fromEntries(measured.map((a, k) => [`k${k}.a`, [a, 0.06]])),
  parts: [
    { to: () => 0.4, pace: 4, caption: "בכל מדידה עוברת משקולת אחת מהעגלה לסל. הכינו טבלה של m, Fg ו-a, ושרטטו את הגרף של a כפונקציה של Fg." },
    { to: () => 0.4, pace: 4, caption: "אילו כוחות פועלים על העגלה, ואילו על הסל?" },
    { to: () => 0.4, pace: 4, caption: "מה הביטוי של a כפונקציה של Fg? האם הוא לינארי?" },
    { to: () => 0.4, pace: 4, caption: "מה המסה של העגלה M0, לפי הגרף?" },
  ],
  draw: (P, m, t, part) => {
    [0, 1, 2, 3, 4, 5].forEach((k) => {
      const y = -0.1 * k;
      const s = m.state(t), c = s[`k${k}.c`], b = s[`k${k}.b`];
      P.line(0, y, 1.1, y, { tone: "line", w: 1 });
      P.cart(0.1 + c.x, y, { wPx: 30 });
      P.mono(0.1 + c.x, y, String(6 - k), { tone: "data", size: 9, dyPx: -22 });
      P.circle(1.12, y + 0.02, 3, { fill: "line" });
      P.line(0.13 + c.x, y + 0.02, 1.12, y + 0.02, { tone: "line", w: 1 });
      const by = y - 0.06 + 0.5 * b.y;
      P.line(1.14, y + 0.02, 1.14, by + 0.01, { tone: "line", w: 1 });
      P.block(1.14, by, { wPx: 12 + 2 * k, hPx: 10, base: false, tone: "b2" });
      P.mono(1.3, y, `${measured[k]}`, { tone: "data", size: 10, dyPx: 4 });
    });
    P.textPx(P.sx(1.3), 16, "a (m/s²)", { tone: "text", size: 10 });
    if (part === 0) askLabel(P, 0.6, 0.1, "a(Fg) ?", 0, 0);
    if (part === 1) askLabel(P, 0.6, 0.1, "?", 0, 0);
    if (part === 2) askLabel(P, 0.6, 0.1, "a = f(Fg) ?", 0, 0);
    if (part === 3) askLabel(P, 0.6, 0.1, "M0 = ?", 0, 0);
  },
});
