import { body, type Story } from "../engine";
import { askLabel, askWidth, storySpec } from "../kits";

/** 2013 q3: a 1500 kg car brakes from 15 m/s with a constant deceleration (f = 3000 N, so a = 2 m/s²): ℓ = 56.25 m. Also from 30 m/s, and with 1.5 times the deceleration. */
const m = 1500, f = 3000, a = f / m;
const brake = (v: number, dec: number): Story => ({ init: { c: body(0, 0, v, 0) }, phases: [{ end: "stop", acc: { c: [-dec, 0] }, dur: (s) => s.c.vx / dec, force: () => ({ c: [-dec, 0] }), until: (s) => s.c.vx <= 0, jump: (s) => { s.c.vx = 0; } }], record: { l: ["stop", (s) => s.c.x] } });
export const spec = storySpec({
  id: "bagrut-2013-q3",
  view: { x0: -10, x1: 240, y0: -30, y1: 95 },
  scale: 225,
  scenarios: { base: brake(15, a), fast: brake(30, a), tires: brake(15, 1.5 * a) },
  order: { base: ["stop"], fast: ["stop"], tires: ["stop"] },
  answers: { "base.l": [56.25, 1e-9], "fast.l": [225, 1e-9], "tires.l": [37.5, 1e-9] },
  parts: [
    { to: (mm) => mm.events["base.stop"], pace: 0.5, caption: "המכונית בולמת בתאוצה קבועה ונעצרת אחרי ℓ. מה הקשר בין v0² ל-ℓ?" },
    { to: (mm) => mm.events["fast.stop"], pace: 0.5, caption: "במהירות כפולה ובאותה תאוצה: פי כמה משתנה מרחק הבלימה?" },
    { to: (mm) => mm.events["base.stop"], pace: 0.5, caption: "עם צמיגים חדשים התאוצה גדולה פי 1.5. פי כמה קטן מרחק הבלימה?" },
    { to: (mm) => mm.events["base.stop"], pace: 0.5, caption: "v0 = 15 m/s, m = 1500 kg. כמה אנרגיה הפכה לחום בבלימה?" },
    { to: (mm) => mm.events["base.stop"], pace: 0.5, caption: "הכוח השקול בבלימה 3000 N. מה מרחק הבלימה ℓ?" },
  ],
  draw: (P, mm, t, part) => {
    const rows = part === 1 ? [["base", 0], ["fast", 40]] : part === 2 ? [["base", 0], ["tires", 40]] : [["base", 0]];
    for (const [k, y] of rows as [string, number][]) {
      P.ground(y, -8, 238);
      const c = mm.state(Math.min(t, mm.events[`${k}.stop`]))[`${k}.c`];
      P.cart(c.x, y, { wPx: 40, tone: k === "base" ? "body" : "b2" });
      if (t >= mm.events[`${k}.stop`] - 1e-9 && (part === 1 || part === 2 || part === 4 || part === 0)) askWidth(P, 0, c.x, y, "ℓ = ?", 26);
    }
    if (part === 3) askLabel(P, 30, 60, "Q = ?", 0, 0);
  },
});
