import { askLabel, spinMotion } from "../kits";

/**
 * 2009 q3: a motor turns a vertical axis; a ball on a string L moves in a horizontal circle. The table: f and α.
 * cos α = g/(4π²L)·(1/f²); the trend gives L ≈ 1.48 m. Drawn at the table's f = 0.6 Hz (α from the formula).
 */
const g = 10, F = [0.42, 0.45, 0.5, 0.6, 0.7, 1], A = [18, 32, 45, 63, 70, 80];
const X = F.map((f) => 1 / f ** 2), Y = A.map((a) => Math.cos((a * Math.PI) / 180));
const xm = X.reduce((p, q) => p + q) / 6, ym = Y.reduce((p, q) => p + q) / 6;
const slope = X.reduce((acc, x, i) => acc + (x - xm) * (Y[i] - ym), 0) / X.reduce((acc, x) => acc + (x - xm) ** 2, 0);
const L = g / (4 * Math.PI ** 2 * slope), f = 0.6;
const al = Math.acos(Math.min(1, g / (4 * Math.PI ** 2 * L * f * f)));
const r = L * Math.sin(al), tilt = 0.3;
export const spec = spinMotion({
  id: "bagrut-2009-q3",
  r,
  period: 1 / f,
  laps: 2,
  answers: { a: [g * Math.tan(al), 1e-6] },
  view: { x0: -2.2, x1: 2.2, y0: -1.6, y1: 0.6 },
  parts: [
    { to: (m) => m.events.lap2, pace: 1, caption: "אילו כוחות פועלים על הכדור? מה הביטוי ל-cos α כפונקציה של 1/f²?" },
    { to: (m) => m.events.lap2, pace: 1, caption: "הוסיפו לטבלה את 1/f² ואת cos α, ושרטטו את הגרף." },
    { to: (m) => m.events.lap2, pace: 1, caption: "מה אורך החוט L, לפי שיפוע הגרף?" },
    { to: (m) => m.events.lap2, pace: 1, caption: "מה התדירות הקטנה ביותר שבה הכדור ינוע במעגל?" },
  ],
  draw: (P, c, _m, _t, part) => {
    const scr = (x: number, z: number, y: number): [number, number] => [x, y + tilt * z];
    const yc = -L * Math.cos(al);
    P.line(0, 0.45, 0, 0, { tone: "line", w: 4 });
    P.block(0, 0.45, { wPx: 30, hPx: 16, base: false, tone: "line" });
    const p = scr(c.x, c.z, yc);
    P.poly(Array.from({ length: 61 }, (_, i) => { const a = (2 * Math.PI * i) / 60; return scr(r * Math.cos(a), r * Math.sin(a), yc); }), { close: false, fill: "none", tone: "idle", w: 1, dash: "4 4" });
    P.line(0, 0, p[0], p[1], { tone: "line", w: 1.6 });
    P.circle(p[0], p[1], 8, { fill: "body" });
    P.line(0, 0, 0, yc, { tone: "idle", w: 1, dash: "3 3" });
    F.forEach((ff, i) => { P.textPx(470 + i * 40, 30, String(ff), { tone: "data", size: 11 }); P.textPx(470 + i * 40, 52, `${A[i]}°`, { tone: "data", size: 11 }); });
    P.textPx(450, 30, "f (Hz)", { tone: "text", size: 11, anchor: "end" });
    P.textPx(450, 52, "α", { tone: "text", size: 11, anchor: "end" });
    if (part === 0) askLabel(P, p[0], p[1], "cos α = ?", 16, 16);
    if (part === 1) askLabel(P, 1.2, 0.1, "cos α (1/f²) ?", 0, 0);
    if (part === 2) askLabel(P, 0, yc / 2, "L = ?", 40, 0);
    if (part === 3) askLabel(P, 0, 0.45, "f min = ?", 30, 0);
  },
});
