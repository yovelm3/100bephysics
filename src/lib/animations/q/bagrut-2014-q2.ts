import { body } from "../engine";
import { askLabel, askWidth, storySpec } from "../kits";

/**
 * 2014 q2: a car starts (the road's friction on the driven wheels pushes it forward); braking from 90 km/h with locked
 * wheels slides 312.5 m on ice (μ = 0.1) and 39.06 m without ice (μ = 0.8). Part ד: 1000 kg, 1200 N forward, 400 N of
 * friction against the motion.
 */
const g = 10;
const brake = (mu: number) => ({
  init: { c: body(0, 0, 25, 0) },
  phases: [{ end: "stop", acc: { c: [-mu * g, 0] as [number, number] }, dur: (s: { c: { vx: number } }) => s.c.vx / (mu * g), force: () => ({ c: [-mu * g, 0] as [number, number] }), until: (s: { c: { vx: number } }) => s.c.vx <= 0, jump: (s: { c: { vx: number } }) => { s.c.vx = 0; } }],
  record: { d: ["stop", (s: { c: { x: number } }) => s.c.x] as [string, (s: never) => number] },
});
export const spec = storySpec({
  id: "bagrut-2014-q2",
  view: { x0: -4, x1: 36, y0: -2, y1: 18 },
  views: [0, 1, 2, 3, 4].map((i) => (i === 2 ? { x0: -12, x1: 340, y0: -40, y1: 136 } : { x0: -4, x1: 36, y0: -2, y1: 18 })),
  scale: 300,
  scenarios: {
    go: { init: { c: body(0, 0, 0, 0) }, phases: [{ end: "end", acc: { c: [0.8, 0] }, dur: () => 5, force: () => ({ c: [(1200 - 400) / 1000, 0] }), until: (_s, t) => t >= 5 - 1e-12 }], record: { a: ["end", (s) => s.c.vx / 5] } },
    ice: brake(0.1) as never,
    dry: brake(0.8) as never,
  },
  order: { go: ["end"], ice: ["stop"], dry: ["stop"] },
  answers: { "ice.d": [312.5, 1e-9], "dry.d": [39.0625, 1e-9], "go.a": [0.8, 1e-9] },
  parts: [
    { to: () => 5, pace: 1, caption: "המכונית מתחילה לנסוע. איזה כוח חיצוני דוחף אותה קדימה, ומי מפעיל אותו?" },
    { to: () => 5, pace: 1, caption: "על קרח המכונית לא יכולה להגיע לאותה תאוצה. למה?" },
    { to: (m) => m.events["ice.stop"], pace: 0.12, caption: "המכונית בולמת מ-90 קמ\"ש והגלגלים ננעלים. מה מרחק הבלימה עם קרח, ומה בלי קרח?" },
    { to: () => 5, pace: 1, caption: "1000 ק\"ג, כוח של 1200 N קדימה, וחיכוך של 400 N נגד התנועה. מה התאוצה?" },
    { to: () => 5, pace: 1, caption: "למה לכל מכונית יש מהירות מרבית, גם אם היא מאיצה הרבה זמן?" },
  ],
  draw: (P, m, t, part) => {
    if (part === 2) {
      P.ground(0, -10, 338);
      P.line(-10, 60, 338, 60, { tone: "line", w: 1 });
      const ice = m.state(t)["ice.c"], dry = m.state(Math.min(t, m.events["dry.stop"]))["dry.c"];
      P.poly([[0, 60], [330, 60], [330, 62], [0, 62]], { tone: "soft", fill: "soft" });
      P.heb(160, 64, "קרח", { tone: "data", size: 11, dyPx: -8 });
      P.cart(ice.x, 62, { wPx: 40 }); P.cart(dry.x, 0, { wPx: 40, tone: "b2" });
      if (t >= m.events["ice.stop"] - 1e-9) askWidth(P, 0, ice.x, 62, "d = ?", 30);
      if (t >= m.events["dry.stop"] - 1e-9) askWidth(P, 0, dry.x, 0, "d = ?", 30);
      return;
    }
    const c = m.state(t)["go.c"];
    P.ground(0, -3, 35);
    if (part === 1) P.poly([[-3, 0], [35, 0], [35, -0.4], [-3, -0.4]], { tone: "soft", fill: "soft" });
    P.cart(c.x, 0, { wPx: 60 });
    if (c.vx > 0.05) P.arrowPx(c.x, 3, c.vx * 14, 0, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, c.x, 0, "F = ?", 0, 30);
    if (part === 1) askLabel(P, c.x, 0, "?", 0, 30);
    if (part === 3) { P.arrowPx(c.x + 1, 1, 48, 0, { tone: "force", label: "1200 N" }); P.arrowPx(c.x - 1, 1, -16, 0, { tone: "force", label: "400 N" }); askLabel(P, c.x, 3, "a = ?", 0, -30); }
    if (part === 4) askLabel(P, c.x, 3, "v max ?", 0, -30);
  },
});
