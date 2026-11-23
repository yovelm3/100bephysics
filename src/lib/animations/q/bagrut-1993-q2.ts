import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1993 q2: two bodies of mass M on string b over a pulley hung from string c. Figure ב: m hangs under the right body on
 * string d, so the bodies accelerate (a = mg/(2M + m) < g). Later d breaks: the right body goes on at constant speed.
 * Drawn: M = 1 kg, m = 0.5 kg; d breaks after 0.7 s; an elevator going down at a constant 0.6 m/s at the side.
 */
const g = 10, M = 1, m = 0.5, tBreak = 0.7, y0 = 3;
const a = (m * g) / (2 * M + m);
// build 2: each body with its tensions: right body M (Tb up, Td down), m (Td up), left body M (Tb up)
const tied = (): Record<string, [number, number]> => {
  const Tb = M * (g + a), Td = m * (g - a);
  return { L: [0, (Tb - M * g) / M], R: [0, (Tb - Td - M * g) / M], m: [0, (Td - m * g) / m] };
};
export const spec = storySpec({
  id: "bagrut-1993-q2",
  view: { x0: -3.4, x1: 3.4, y0: -0.2, y1: 3.2 },
  scale: 3,
  story: {
    init: { L: body(-0.35, 1.8, 0, 0), R: body(0.35, 1.8, 0, 0), m: body(0.35, 1.2, 0, 0) },
    phases: [
      { end: "break", acc: { L: [0, a], R: [0, -a], m: [0, -a] }, dur: () => tBreak, force: tied, until: (_s, t) => t >= tBreak - 1e-12 },
      { end: "end", acc: { m: [0, -g] }, dur: (s) => (s.m.vy + Math.sqrt(s.m.vy ** 2 + 2 * g * (s.m.y - 0.1))) / g, force: () => ({ m: [0, -g] }), until: (s) => s.m.y <= 0.1, jump: (s) => { s.m.vy = 0; } },
    ],
    record: { a: ["break", (s) => -s.R.vy / tBreak] },
  },
  order: ["break", "end"],
  answers: { a: [a, 1e-9] },
  parts: [
    { to: () => 0.6, pace: 1, caption: "תרשים א: שני גופים במסה M משני צדי הגלגלת. מה המתיחות בחוט b?" },
    { to: () => 0.6, pace: 1, caption: "מה המתיחות בחוט c, שמחזיק את הגלגלת?" },
    { to: (mm) => mm.events.break, pace: 1, caption: "תרשים ב: תולים את m מתחת לגוף הימני. למה התאוצה של m קטנה מ-g?" },
    { to: (mm) => mm.events.break, pace: 1, caption: "אדם במעלית שיורדת במהירות קבועה מסתכל על m. איזו תאוצה הוא רואה?" },
    { to: (mm) => mm.events.end, pace: 1, caption: "החוט d נקרע. איזו תנועה עושה הגוף הימני מעכשיו?" },
  ],
  draw: (P, mm, t, part) => {
    const fig2 = part >= 2;
    const s = fig2 ? mm.state(t) : mm.state(0);
    P.ground(0, -1.4, 1.4);
    P.line(-0.8, y0, 0.8, y0, { tone: "line", w: 3 });
    P.line(0, y0, 0, 2.7, { tone: "line", w: 1.4 }); P.mono(0.08, 2.85, "c", { tone: "data", size: 11, anchor: "start" });
    P.pulley(0, 2.55, 20);
    P.line(-0.35, 2.55, -0.35, s.L.y + 0.12, { tone: "line", w: 1.4 });
    P.line(0.35, 2.55, 0.35, s.R.y + 0.12, { tone: "line", w: 1.4 }); P.mono(0.43, 2.3, "b", { tone: "data", size: 11, anchor: "start" });
    P.block(-0.35, s.L.y, { wPx: 32, hPx: 28, base: false, label: "M" });
    P.block(0.35, s.R.y, { wPx: 32, hPx: 28, base: false, label: "M" });
    if (fig2) {
      if (t < mm.events.break) { P.line(0.35, s.R.y - 0.12, 0.35, s.m.y + 0.1, { tone: "line", w: 1.4 }); P.mono(0.43, (s.R.y + s.m.y) / 2, "d", { tone: "data", size: 11, anchor: "start" }); }
      P.block(0.35, s.m.y, { wPx: 24, hPx: 22, base: false, label: "m", tone: "b2" });
    }
    if (part === 3) {
      // the elevator going down at constant speed, with a window
      const ey = 2.4 - 0.6 * t;
      P.poly([[1.6, ey - 0.8], [2.6, ey - 0.8], [2.6, ey + 0.4], [1.6, ey + 0.4]]);
      P.heb(2.1, ey + 0.6, "מעלית", { tone: "text", size: 11 });
      P.circle(2.0, ey, 5, { fill: "runner" });
      P.arrowPx(2.85, ey, 0, 30, { tone: "vel", label: "v" });
    }
    if (part === 0) askLabel(P, 0.35, 2.2, "T_b = ?", 30, 0);
    if (part === 1) askLabel(P, 0, 2.85, "T_c = ?", 30, -4);
    if (part === 2) askLabel(P, 0.35, s.m.y, "a < g ?", 30, 0);
    if (part === 3) askLabel(P, 0.35, s.m.y, "a' ?", 30, 0);
    if (part === 4 && t >= mm.events.break) askLabel(P, 0.35, s.R.y, "?", 30, 0);
  },
});
