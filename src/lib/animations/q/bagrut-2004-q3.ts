import { askLabel, spinMotion } from "../kits";

/** 2004 q3: a weight on a rope from a turning arm, at α to the vertical (drawn 40°, arm 1.2 m, rope 2 m). Seen from the side, a little from above. */
const g = 10, b = 1.2, l = 2, al = (40 * Math.PI) / 180;
const r = b + l * Math.sin(al), w = Math.sqrt((g * Math.tan(al)) / r);
const H = 4.6, tilt = 0.3;
export const spec = spinMotion({
  id: "bagrut-2004-q3",
  r,
  period: (2 * Math.PI) / w,
  laps: 2,
  answers: { a: [g * Math.tan(al), 1e-6] },
  view: { x0: -4.4, x1: 4.4, y0: -0.2, y1: 5.5 },
  parts: [
    { to: (m) => m.events.lap2, pace: 0.8, caption: "גודל המהירות קבוע. למה יש למשקולת תאוצה, ומה הכיוון שלה?" },
    { to: (m) => m.events.lap2, pace: 0.8, caption: "האם הכוח השקול על המשקולת אפס? אם לא, מה הכיוון שלו?" },
    { to: (m) => m.events.lap1 / 2, pace: 0.8, caption: "מה הכיוון של המהירות ברגע שהמשקולת עוברת בנקודה A?" },
    { to: (m) => m.events.lap2, pace: 0.8, caption: "מה רדיוס המעגל, לפי α ו-ω?" },
    { to: (m) => m.events.lap2, pace: 0.8, caption: "באיזו זווית α התאוצה של המשקולת שווה ל-g?" },
  ],
  draw: (P, c, m, t, part) => {
    const scr = (x: number, z: number, y: number): [number, number] => [x, y + tilt * z];
    P.ground(0, -4.2, 4.2);
    P.line(0, 0, 0, H, { tone: "line", w: 4 });
    const u = { x: c.x / r, z: c.z / r };
    const tip = scr(b * u.x, b * u.z, H), wt = scr(c.x, c.z, H - l * Math.cos(al));
    P.line(0, H, tip[0], tip[1], { tone: "line", w: 3 });
    P.line(tip[0], tip[1], wt[0], wt[1], { tone: "line", w: 1.6 });
    P.circle(wt[0], wt[1], 8, { fill: "body" });
    P.poly(Array.from({ length: 61 }, (_, i) => { const a = (2 * Math.PI * i) / 60; return scr(r * Math.cos(a), r * Math.sin(a), H - l * Math.cos(al)); }), { close: false, fill: "none", tone: "idle", w: 1, dash: "4 4" });
    const Apt = scr(-r, 0, H - l * Math.cos(al));
    P.mono(Apt[0], Apt[1], "A", { tone: "data", size: 12, dxPx: -12 });
    if (part !== 2 || t < m.events.lap1 / 2 - 1e-9) P.arrowPx(wt[0], wt[1], c.vx * 6, -tilt * c.vz * 6, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, wt[0], wt[1], "a ?", 16, 20);
    if (part === 1) askLabel(P, wt[0], wt[1], "ΣF ?", 16, 20);
    if (part === 2 && t >= m.events.lap1 / 2 - 1e-9) askLabel(P, wt[0], wt[1], "v ?", 16, 20);
    if (part === 3) askLabel(P, wt[0], wt[1], "r = ?", 16, 20);
    if (part === 4) askLabel(P, (tip[0] + wt[0]) / 2, (tip[1] + wt[1]) / 2, "α = ?", 16, 0);
  },
});
