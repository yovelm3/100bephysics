import { askLabel, spinMotion } from "../kits";

/** 2006 q4: a car on a flat curve of R = 80 m with μs = 0.4 (seen from above, at its top speed); then the road banked at θ (cross-section at the right). */
const g = 10, R = 80, mu = 0.4;
const v = Math.sqrt(mu * g * R);
export const spec = spinMotion({
  id: "bagrut-2006-q4",
  r: R,
  period: (2 * Math.PI * R) / v,
  laps: 1,
  answers: { v: [17.88854381999832, 1e-6] },
  view: { x0: -125, x1: 125, y0: -95, y1: 30 },
  parts: [
    { to: (m) => m.events.lap1, pace: 0.2, caption: "מה המהירות הגדולה ביותר שבה המכונית יכולה לנסוע בעקומה בלי להחליק?" },
    { to: (m) => m.events.lap1, pace: 0.2, caption: "מגביהים את הכביש בזווית θ. מה θ, כדי לנסוע באותה מהירות גם בלי חיכוך?" },
    { to: (m) => m.events.lap1, pace: 0.2, caption: "בכביש המוגבה, במהירות גדולה יותר: איזה שרטוט מתאר את הכוחות?" },
    { to: (m) => m.events.lap1 / 8, pace: 0.2, caption: "ההגבהה הוקטנה ל-15°, והמכוניות עצרו בעקומה. האם הן יחליקו?" },
  ],
  draw: (P, c, _m, _t, part) => {
    const cy = -35, sq = 0.5;
    P.poly(Array.from({ length: 81 }, (_, i) => { const a = (2 * Math.PI * i) / 80; return [R * Math.cos(a), cy + sq * R * Math.sin(a)] as [number, number]; }), { close: false, fill: "none", tone: "line", w: 10 });
    const stopped = part === 3;
    const p: [number, number] = stopped ? [R, cy] : [c.x, cy + sq * c.z];
    P.block(p[0], p[1], { wPx: 20, hPx: 12, base: false });
    if (!stopped) P.arrowPx(p[0], p[1], c.vx * 1.6, -sq * c.vz * 1.6, { tone: "vel", label: "v" });
    if (part > 0) {
      const x0 = 86, y0 = 8, w = 32, al = part === 3 ? (15 * Math.PI) / 180 : 0.38;
      P.poly([[x0, y0], [x0 + w * Math.cos(al), y0 + w * Math.sin(al)], [x0 + w * Math.cos(al), y0]]);
      P.block(x0 + 0.5 * w * Math.cos(al), y0 + 0.5 * w * Math.sin(al), { wPx: 22, hPx: 12, angle: al });
      P.mono(x0 + 6, y0, part === 3 ? "15°" : "θ", { tone: "data", size: 11, dyPx: -4, anchor: "start" });
    }
    if (part === 0) askLabel(P, p[0], p[1], "v max = ?", 16, -16);
    if (part === 1) askLabel(P, 100, 22, "θ = ?", 0, -20);
    if (part === 2) askLabel(P, 100, 22, "?", 0, -20);
    if (part === 3) askLabel(P, 100, 22, "?", 0, -20);
  },
});
