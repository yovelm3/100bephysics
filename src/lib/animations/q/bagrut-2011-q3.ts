import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2011 q3: A (0.1 kg) and B (0.2 kg) pushed apart by a spring: A at 0.6 m/s toward the wall, B at 0.3 m/s the other way.
 * A bounces elastically off the wall (drawn instant); B meets C (0.4 kg) coming toward it at 0.15 m/s; they stick and stop.
 */
const mB = 0.2, mC = 0.4;
export const spec = storySpec({
  id: "bagrut-2011-q3",
  view: { x0: -0.15, x1: 3.15, y0: -0.3, y1: 1.35 },
  scale: 3,
  story: {
    init: { A: body(1.0, 0, -0.6, 0), B: body(1.25, 0, 0.3, 0), C: body(2.8, 0, -0.15, 0) },
    phases: [
      { end: "wall", acc: {}, dur: (s) => (s.A.x - 0.06) / 0.6, force: () => ({}), until: (s) => s.A.x <= 0.06, jump: (s) => { s.A.vx = -s.A.vx; } },
      { end: "stick", acc: {}, dur: (s) => (s.C.x - s.B.x - 0.14) / (s.B.vx - s.C.vx), force: () => ({}), until: (s) => s.C.x - s.B.x <= 0.14, jump: (s) => { const V = (mB * s.B.vx + mC * s.C.vx) / (mB + mC); s.B.vx = V; s.C.vx = V; } },
      { end: "end", acc: {}, dur: () => 1, force: () => ({}), until: (_s, t, t0) => t - t0 >= 1 - 1e-12 },
    ],
    record: { uA: ["wall", (s) => s.A.vx], J: ["wall", (s) => 0.1 * 2 * s.A.vx], V: ["stick", (s) => s.B.vx] },
  },
  order: ["wall", "stick", "end"],
  answers: { uA: [0.6, 1e-9], J: [0.12, 1e-9], V: [0, 1e-9] },
  parts: [
    { to: () => 0.3, pace: 1, caption: "הקפיץ משתחרר. מה התנע של המערכת של A ו-B מיד אחרי השחרור?" },
    { to: () => 0.3, pace: 1, caption: "A נע לכיוון הקיר ב-0.6 m/s. מה המהירות של B?" },
    { to: (m) => m.events.wall + 0.6, pace: 1, caption: "A מתנגש בקיר התנגשות אלסטית. מה המהירות שלו מיד אחרי?" },
    { to: (m) => m.events.wall + 0.6, pace: 1, caption: "מה המתקף שהקיר מפעיל על A?" },
    { to: (m) => m.events.wall + 0.6, pace: 1, caption: "מה מייצג השטח שבין גרף הכוח של הקיר לציר הזמן?" },
    { to: (m) => m.events.wall + 0.6, pace: 1, caption: "מה הכוח המרבי שהקיר הפעיל על A?" },
    { to: (m) => m.events.end, pace: 1, caption: "B מתנגש ב-C ונדבק אליו, ומיד אחרי זה שניהם עומדים. מה הייתה המהירות של C?" },
    { to: (m) => m.events.end, pace: 1, caption: "אם C היה איטי יותר, לאן היו נעים B ו-C אחרי שנדבקו?" },
  ],
  draw: (P, m, t, part) => {
    P.line(0, 0, 3.1, 0, { tone: "line", w: 2 });
    P.wall(0, 0, 0.6, "left");
    const s = m.state(t);
    P.block(s.A.x, 0, { wPx: 22, hPx: 20, label: "A" });
    P.block(s.B.x, 0, { wPx: 28, hPx: 24, label: "B", tone: "b2" });
    if (part >= 6) P.block(s.C.x, 0, { wPx: 36, hPx: 30, label: "C", tone: "runner" });
    for (const k of ["A", "B", ...(part >= 6 ? ["C"] : [])]) if (Math.abs(s[k].vx) > 0.01) P.arrowPx(s[k].x, 0.4 + (k === "B" ? 0.25 : k === "C" ? 0.5 : 0), s[k].vx * 120, 0, { tone: "vel", label: k });
    const after = t >= m.events.wall - 1e-9;
    if (part === 0) askLabel(P, 1.1, 1.1, "p = ?", 0, 0);
    if (part === 1) askLabel(P, s.B.x, 0.65, "vB = ?", 30, -10);
    if ((part === 2 || part === 3 || part === 5) && after) askLabel(P, s.A.x, 0.4, part === 2 ? "u = ?" : part === 3 ? "J = ?" : "F max = ?", 30, -10);
    if (part === 4) askLabel(P, 0.05, 0.3, "∫F dt ?", 30, -10);
    if (part === 6 && t >= m.events.stick - 1e-9) askLabel(P, s.C.x, 0.9, "vC = ?", 0, -10);
    if (part === 7) askLabel(P, 2.2, 1.1, "?", 0, 0);
  },
});
