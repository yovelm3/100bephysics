import { askLabel, spinMotion } from "../kits";

/**
 * 2000 q2: a car on a flat circular road at constant speed (drawn R = 50 m, 15 m/s), seen from above; parts ב–ג:
 * a road banked at α with no friction, shown also as a cross-section.
 */
const R = 50, v = 15;
export const spec = spinMotion({
  id: "bagrut-2000-q2",
  r: R,
  period: (2 * Math.PI * R) / v,
  laps: 1,
  answers: { v: [v, 1e-6] },
  view: { x0: -80, x1: 80, y0: -62, y1: 18 },
  parts: [
    { to: (m) => m.events.lap1, pace: 0.25, caption: "כביש אופקי, מקדם חיכוך סטטי μs. מה המהירות הגדולה ביותר בלי להחליק?" },
    { to: (m) => m.events.lap1, pace: 0.25, caption: "כביש נטוי בזווית α, בלי חיכוך. אילו כוחות פועלים על המכונית?" },
    { to: (m) => m.events.lap1, pace: 0.25, caption: "מה המהירות של המכונית בכביש הנטוי, לפי R ו-α?" },
  ],
  draw: (P, c, _m, _t, part) => {
    // seen from above, squeezed to fit (x, z/2)
    const cy = -22, sq = 0.5;
    P.poly(Array.from({ length: 81 }, (_, i) => { const a = (2 * Math.PI * i) / 80; return [R * Math.cos(a), cy + sq * R * Math.sin(a)] as [number, number]; }), { close: false, fill: "none", tone: "line", w: 10 });
    P.block(c.x, cy + sq * c.z, { wPx: 20, hPx: 12, base: false });
    P.arrowPx(c.x, cy + sq * c.z, c.vx * 2.4, -sq * c.vz * 2.4, { tone: "vel", label: "v" });
    if (part > 0) {
      // the cross-section of the banked road, at the right
      const x0 = 56, y0 = 6, w = 20, al = 0.35;
      P.poly([[x0, y0], [x0 + w * Math.cos(al), y0 + w * Math.sin(al)], [x0 + w * Math.cos(al), y0]]);
      P.block(x0 + 0.5 * w * Math.cos(al), y0 + 0.5 * w * Math.sin(al), { wPx: 22, hPx: 12, angle: al });
      P.mono(x0 + 4, y0, "α", { tone: "data", size: 11, dyPx: -4 });
    }
    if (part === 0) askLabel(P, c.x, cy + sq * c.z, "v max = ?", 16, -16);
    if (part === 1) askLabel(P, 66, 10, "?", 0, -24);
    if (part === 2) askLabel(P, c.x, cy + sq * c.z, "v = ?", 16, -16);
  },
});
