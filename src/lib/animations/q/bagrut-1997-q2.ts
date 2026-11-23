import { askLabel, spinMotion } from "../kits";

/** 1997 q2: a chair with a scale and a boy on it, on a rope from a turning arm; the rope at α to the vertical (drawn 35°, arm 1.5 m, rope 2.5 m). */
const g = 10, b = 1.5, l = 2.5, al = (35 * Math.PI) / 180;
const r = b + l * Math.sin(al), w = Math.sqrt((g * Math.tan(al)) / r);
const H = 5.6, tilt = 0.3;
export const spec = spinMotion({
  id: "bagrut-1997-q2",
  r,
  period: (2 * Math.PI) / w,
  laps: 2,
  answers: { a: [g * Math.tan(al), 1e-6] },
  view: { x0: -5.2, x1: 5.2, y0: -0.2, y1: 6.6 },
  parts: [
    { to: (m) => m.events.lap2, pace: 0.8, caption: "הכיסא נע במעגל אופקי, והחבל בזווית α לאנך. מה המתיחות בחבל?" },
    { to: (m) => m.events.lap2, pace: 0.8, caption: "מה גודל התאוצה של הכיסא?" },
    { to: (m) => m.events.lap2, pace: 0.8, caption: "אילו כוחות פועלים על הנער, ומי מפעיל כל אחד?" },
    { to: (m) => m.events.lap2, pace: 0.8, caption: "האם המאזניים מראים mg, יותר או פחות?" },
  ],
  draw: (P, c, _m, _t, part) => {
    const scr = (x: number, z: number, y: number): [number, number] => [x, y + tilt * z];
    P.ground(0, -5, 5);
    P.line(0, 0, 0, H, { tone: "line", w: 4 });
    const u = { x: c.x / r, z: c.z / r };
    const tip = scr(b * u.x, b * u.z, H), chair = scr(c.x, c.z, H - l * Math.cos(al));
    P.line(0, H, tip[0], tip[1], { tone: "line", w: 3 });
    P.line(tip[0], tip[1], chair[0], chair[1], { tone: "line", w: 1.6 });
    P.block(chair[0], chair[1], { wPx: 26, hPx: 10, base: false, tone: "line" });
    P.person(chair[0], chair[1] + 0.1, 0, { tone: "runner" });
    P.arrowPx(chair[0], chair[1] - 0.3, c.vx * 5, -tilt * c.vz * 5, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, (tip[0] + chair[0]) / 2, (tip[1] + chair[1]) / 2, "T = ?", 16, 0);
    if (part === 1) askLabel(P, chair[0], chair[1], "a = ?", 24, 20);
    if (part === 2) askLabel(P, chair[0], chair[1] + 0.6, "?", 24, 0);
    if (part === 3) askLabel(P, chair[0], chair[1], "N ? mg", 24, 20);
  },
});
