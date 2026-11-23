import { askLabel, spinMotion } from "../kits";

/** 2010 q2: a bead in a smooth cone (half-angle α = 30°) moves in a horizontal circle at height H = 20 cm; v² = gH, r = H·tan α. */
const g = 10, al = Math.PI / 6, H = 0.2;
const v = Math.sqrt(g * H), r = H * Math.tan(al), tilt = 0.3;
export const spec = spinMotion({
  id: "bagrut-2010-q2",
  r,
  period: (2 * Math.PI * r) / v,
  laps: 3,
  answers: { v: [1.4142135623730951, 1e-6] },
  view: { x0: -0.32, x1: 0.32, y0: -0.04, y1: 0.28 },
  parts: [
    { to: (m) => m.events.lap3, pace: 3, caption: "החרוז נע במעגל אופקי בתוך החרוט. אילו כוחות פועלים עליו?" },
    { to: (m) => m.events.lap3, pace: 3, caption: "מה משוואות התנועה: בכיוון הרדיאלי ובכיוון האנכי?" },
    { to: (m) => m.events.lap3, pace: 3, caption: "נתונה המהירות v. מה הגובה H של מישור התנועה?" },
    { to: (m) => m.events.lap3, pace: 3, caption: "אם החרוז מאבד אנרגיה קינטית, מה קורה לגובה של מישור התנועה?" },
    { to: (m) => m.events.lap3, pace: 3, caption: "α = 30°, H = 20 cm. מה המהירות של החרוז?" },
    { to: (m) => m.events.lap3, pace: 3, hideClock: true, caption: "מה זמן המחזור של התנועה?" },
  ],
  draw: (P, c, _m, _t, part) => {
    const scr = (x: number, z: number, y: number): [number, number] => [x, y + tilt * z];
    const Hc = 0.26, R = Hc * Math.tan(al);
    P.line(0, 0, -R, Hc, { tone: "line", w: 2.2 }); P.line(0, 0, R, Hc, { tone: "line", w: 2.2 });
    P.poly(Array.from({ length: 61 }, (_, i) => { const a = (2 * Math.PI * i) / 60; return scr(R * Math.cos(a), R * Math.sin(a), Hc); }), { close: false, fill: "none", tone: "line", w: 1.4 });
    P.poly(Array.from({ length: 61 }, (_, i) => { const a = (2 * Math.PI * i) / 60; return scr(r * Math.cos(a), r * Math.sin(a), H); }), { close: false, fill: "none", tone: "idle", w: 1, dash: "3 3" });
    const p = scr(c.x, c.z, H);
    P.circle(p[0], p[1], 6, { fill: "body" });
    P.arrowPx(p[0], p[1], c.vx * 30, -tilt * c.vz * 30, { tone: "vel", label: "v" });
    P.line(0.25, 0, 0.25, H, { tone: "idle", w: 1 }); P.mono(0.26, H / 2, "H", { tone: "data", size: 12, anchor: "start" });
    P.mono(0.012, 0.05, "α", { tone: "data", size: 11, anchor: "start" });
    if (part === 0) askLabel(P, p[0], p[1], "?", 14, -16);
    if (part === 1) askLabel(P, p[0], p[1], "ΣF ?", 14, -16);
    if (part === 2) askLabel(P, 0.25, H, "H(v) = ?", 10, -14);
    if (part === 3) askLabel(P, 0.25, H, "H ↓ ?", 10, -14);
    if (part === 4) askLabel(P, p[0], p[1], "v = ?", 14, -16);
    if (part === 5) askLabel(P, p[0], p[1], "T = ?", 14, -16);
  },
});
