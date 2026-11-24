import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2000 q3: a skater rolls on the flat and then up a straight slope with no friction. The table: Ek = 260, 200, 140 J at
 * x = 0.4, 0.8, 1.2 m (x horizontal, from the slope's foot), so Ek = 320 − 150x and she stops at x = 2.13 m.
 * Drawn: 50 kg, so tan α = 150/(mg) = 0.3.
 */
const g = 10, m = 50, ta = 0.3, al = Math.atan(ta);
const v0 = Math.sqrt((2 * 320) / m);
const ax = -g * Math.sin(al) * Math.cos(al), ay = -g * Math.sin(al) ** 2;
const tA = (-v0 * Math.cos(al) + Math.sqrt((v0 * Math.cos(al)) ** 2 + 2 * ax * 1.6)) / ax;
export const spec = storySpec({
  id: "bagrut-2000-q3",
  view: { x0: -1.8, x1: 2.6, y0: -0.3, y1: 1.1 },
  scale: 3,
  story: {
    init: { b: body(-1.5, 0, v0, 0) },
    phases: [
      { end: "foot", acc: {}, dur: () => 1.5 / v0, force: () => ({}), until: (s) => s.b.x >= 0, jump: (s) => { const v = Math.hypot(s.b.vx, s.b.vy); s.b.vx = v * Math.cos(al); s.b.vy = v * Math.sin(al); s.b.y = s.b.x * ta; } },
      // build 2: the weight's part along the slope (the normal force cancels the rest)
      { end: "stop", acc: { b: [ax, ay] }, dur: (s) => s.b.vx / -ax, force: () => ({ b: [-g * Math.sin(al) * Math.cos(al), -g * Math.sin(al) * Math.sin(al)] }), until: (s) => s.b.vx <= 0 },
    ],
    marks: { A: [(f) => f.events.foot + tA, (s) => s.b.x >= 1.6] },
    record: { xStop: ["stop", (s) => s.b.x], Ek0: ["foot", (s) => 0.5 * m * (s.b.vx ** 2 + s.b.vy ** 2)] },
  },
  order: ["foot", "A", "stop"],
  answers: { xStop: [2.1333333333333333, 1e-6], Ek0: [320, 1e-9] },
  parts: [
    { to: (mm) => mm.events.stop, pace: 1.4, caption: "הוכיחו שעל המשטח המשופע האנרגיה הקינטית תלויה במקום x בקו ישר." },
    { to: (mm) => mm.events.stop, pace: 1.4, caption: "לפי הטבלה: איך נראה גרף האנרגיה הקינטית כפונקציה של x?" },
    { to: (mm) => mm.events.foot, pace: 1.4, caption: "לפי הגרף: מה האנרגיה הקינטית בתחילת המשטח המשופע?" },
    { to: (mm) => mm.events.A, pace: 1.4, caption: "האם הנערה הגיעה לנקודה A, שבה x = 1.6 m?" },
    { to: (mm) => mm.events.stop, pace: 1.4, caption: "באיזה מקום x על המשטח המשופע הנערה נעצרת?" },
  ],
  draw: (P, mm, t, part) => {
    P.line(-1.75, 0, 0, 0, { tone: "line", w: 2.4 });
    P.line(0, 0, 2.5, 2.5 * ta, { tone: "line", w: 2.4 });
    for (const x of [0.4, 0.8, 1.2]) { P.circle(x, x * ta, 3, { fill: "data" }); }
    P.mono(1.6, 1.6 * ta, "A", { tone: "data", size: 12, dyPx: -10 });
    ["x (m)", "0.4", "0.8", "1.2"].forEach((s, i) => P.textPx(80 + i * 50, 36, s, { tone: i ? "data" : "text", size: 11 }));
    ["Ek (J)", "260", "200", "140"].forEach((s, i) => P.textPx(80 + i * 50, 58, s, { tone: i ? "data" : "text", size: 11 }));
    const b = mm.state(t).b;
    P.person(b.x, b.y, 0, { tone: "runner" });
    if (part === 0) askLabel(P, 1.2, 0.8, "Ek(x) ?", 0, 0);
    if (part === 1) askLabel(P, 1.2, 0.8, "Ek(x) ?", 0, 0);
    if (part === 2 && t >= mm.events.foot - 1e-9) askLabel(P, 0, 0, "Ek = ?", 0, 30);
    if (part === 3) askLabel(P, 1.6, 1.6 * ta, "?", 10, -30);
    if (part === 4 && t >= mm.events.stop - 1e-9) askLabel(P, b.x, b.y, "x = ?", 10, 30);
  },
});
