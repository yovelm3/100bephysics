import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1995 q2: M and m (M > m) tied on a smooth floor; F pulls m (figure א), or a hanging weight equal to F does (figure ב).
 * Drawn: M = 3 kg, m = 1 kg, F = 8 N. Each run lasts until the bodies have moved 2 m.
 */
const g = 10, M = 3, m = 1, F = 8, D = 2;
const run = (hang: boolean): Story => {
  const mw = hang ? F / g : 0;
  const a = F / (M + m + mw);
  return {
    init: { M: body(0, 0, 0, 0), m: body(1.6, 0, 0, 0) },
    phases: [{
      end: "end",
      acc: { M: [a, 0], m: [a, 0] },
      dur: () => Math.sqrt((2 * D) / a),
      // build 2: each body with its own string tension (T1 between M and m, T2 to the weight), solved at every step
      force: () => {
        const T2 = hang ? (F * (M + m)) / (M + m + mw) : F;
        const T1 = (M * T2) / (M + m);
        return { M: [T1 / M, 0], m: [(T2 - T1) / m, 0] };
      },
      until: (s) => s.M.x >= D,
    }],
    record: { a: ["end", (s) => (s.M.vx * s.M.vx) / (2 * s.M.x)] },
  };
};
export const spec = storySpec({
  id: "bagrut-1995-q2",
  view: { x0: -0.6, x1: 7.2, y0: -1.9, y1: 1.6 },
  scale: 6,
  scenarios: { force: run(false), hang: run(true) },
  order: { force: ["end"], hang: ["end"] },
  answers: { "force.a": [F / (M + m), 1e-9] },
  parts: [
    { to: (mm) => mm.events["force.end"], pace: 1, caption: "הכוח F מושך את m, והחוט מושך את M. על איזה גוף פועל כוח שקול גדול יותר?" },
    { to: (mm) => mm.events["force.end"], pace: 1, caption: "בלי חיכוך: מה התאוצה של הגופים ומה המתיחות בחוט ביניהם?" },
    { to: (mm) => mm.events["hang.end"], pace: 1, caption: "עכשיו במקום הכוח תלויה משקולת שמשקלה F. האם התאוצה שונה מקודם?" },
  ],
  draw: (P, mm, t, part) => {
    const key = part === 2 ? "hang" : "force";
    const s = mm.state(Math.min(t, mm.events[`${key}.end`]));
    const bM = s[`${key}.M`], bm = s[`${key}.m`];
    P.poly([[-0.5, 0], [6.4, 0], [6.4, -0.3], [-0.5, -0.3]]);
    P.block(bM.x + 0.4, 0, { wPx: 56, hPx: 34, label: "M" });
    P.block(bm.x + 0.4, 0, { wPx: 36, hPx: 26, label: "m", tone: "b2" });
    P.line(bM.x + 0.9, 0.27, bm.x + 0.1, 0.27, { tone: "line", w: 1.4 });
    if (key === "force") P.arrowPx(bm.x + 0.7, 0.27, 60, 0, { tone: "force", label: "F" });
    else {
      P.pulley(6.6, 0.2, 10);
      P.line(bm.x + 0.7, 0.27, 6.6, 0.27, { tone: "line", w: 1.4 });
      const wy = -0.35 - 0.6 * (bm.x - 1.6); // the weight drops as far as the bodies move (drawn at 0.6 scale)
      P.line(6.78, 0.2, 6.78, wy + 0.2, { tone: "line", w: 1.4 });
      P.block(6.78, wy, { wPx: 22, hPx: 22, base: false, tone: "runner" });
      P.mono(6.78, wy, "F", { tone: "data", size: 11, dxPx: -20 });
    }
    P.arrowPx(bM.x + 0.4, 0.9, bM.vx * 14, 0, { tone: "vel", label: "v" });
    if (part === 0) { askLabel(P, bM.x + 0.4, 0, "ΣF ?", -10, -54); askLabel(P, bm.x + 0.4, 0, "ΣF ?", 0, -46); }
    if (part === 1) { askLabel(P, bM.x + 0.4, 0, "a = ?", -10, -54); askLabel(P, (bM.x + bm.x) / 2 + 0.5, 0.27, "T = ?", 0, 30); }
    if (part === 2) askLabel(P, bM.x + 0.4, 0, "a ?", -10, -54);
  },
});
