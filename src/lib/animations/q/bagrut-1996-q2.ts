import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1996 q2: A (1.4 kg) on a table, tied over a pulley to B (0.6 kg) at 0.54 m above the floor; released from rest.
 * Smooth table: a = 3 m/s², B lands at 0.6 s, then A slides on at constant speed. Part ב: friction (drawn μ = 0.1).
 */
const g = 10, mA = 1.4, mB = 0.6, h = 0.54;
const run = (mu: number): Story => {
  const a1 = (mB * g - mu * mA * g) / (mA + mB), a2 = -mu * g;
  return {
    init: { A: body(-4.6, 0, 0, 0), B: body(0, h, 0, 0) },
    phases: [
      {
        end: "land",
        acc: { A: [a1, 0], B: [0, -a1] },
        dur: () => Math.sqrt((2 * h) / a1),
        // build 2: each body with the string tension T (A: T − f = mA·a; B: mB·g − T = mB·a)
        force: () => { const f = mu * mA * g, T = (mA * mB * g + mB * f) / (mA + mB); return { A: [(T - f) / mA, 0], B: [0, -(mB * g - T) / mB] }; },
        until: (s) => s.B.y <= 0,
        jump: (s) => { s.B.vy = 0; },
      },
      mu === 0
        ? { end: "end", acc: {}, dur: (_s, t0) => 2 - t0, force: () => ({}), until: (_s, t) => t >= 2 - 1e-12 }
        : { end: "end", acc: { A: [a2, 0] }, dur: (s) => s.A.vx / -a2, force: () => ({ A: [-mu * g, 0] }), until: (s) => s.A.vx <= 0, jump: (s) => { s.A.vx = 0; } },
    ],
    record: { vLand: ["land", (s) => s.A.vx] },
  };
};
export const spec = storySpec({
  id: "bagrut-1996-q2",
  view: { x0: -5, x1: 1.6, y0: -1.4, y1: 1.9 },
  scale: 5,
  scenarios: { smooth: run(0), fric: run(0.1) },
  order: { smooth: ["land", "end"], fric: ["land", "end"] },
  answers: { "smooth.land": [0.6, 1e-9], "smooth.vLand": [1.8, 1e-9] },
  parts: [
    { to: (m) => m.events["smooth.land"], pace: 2.2, hideClock: true, caption: "בלי חיכוך ובלי מסת החבל: כעבור כמה זמן מגיע B לרצפה?" },
    { to: (m) => m.events["smooth.end"], pace: 1.2, caption: "איך נראה גרף המהירות של A מהשחרור ועד 2 שניות?" },
    { to: (m) => m.events["fric.end"], pace: 1.2, caption: "עכשיו יש חיכוך בין A לשולחן. איך נראה גרף המהירות של A עד שהוא נעצר?" },
    { to: (m) => m.events["smooth.land"], pace: 2.2, caption: "עכשיו לחבל יש מסה. איזו תנועה עושה A לפני ש-B מגיע לרצפה?" },
  ],
  draw: (P, m, t, part) => {
    const key = part === 2 ? "fric" : "smooth";
    const s = m.state(Math.min(t, m.events[`${key}.end`]));
    const A = s[`${key}.A`], B = s[`${key}.B`];
    const top = 0.9;
    P.poly([[-4.9, top], [0.9, top], [0.9, top - 0.15], [-4.9, top - 0.15]]);
    P.line(0.8, top - 0.15, 0.8, -1, { tone: "line", w: 3 });
    P.ground(-1, -4.9, 1.5);
    P.pulley(1.0, top + 0.12, 9);
    P.block(A.x, top, { wPx: 44, hPx: 28, label: "A" });
    const bTop = -1 + B.y + 0.32;
    P.line(A.x + 0.2, top + 0.15, 1.0, top + 0.15, { tone: "line", w: 1.4 });
    P.line(1.16, top + 0.12, 1.16, bTop, { tone: "line", w: 1.4 });
    P.block(1.16, -1 + B.y, { wPx: 26, hPx: 26, label: "B", tone: "b2" });
    if (part === 0) { P.dim(1.45, -1, 1.45, -1 + h, "0.54 m", { offPx: 0 }); }
    if (A.vx > 0.02) P.arrowPx(A.x, top + 0.55, A.vx * 30, 0, { tone: "vel", label: "v" });
    if (part === 0 && t >= m.events["smooth.land"] - 1e-9) askLabel(P, 1.16, -1, "t = ?", -60, -20);
    if (part === 1 || part === 2) askLabel(P, A.x, top, "v(t) ?", 0, -60);
    if (part === 3) askLabel(P, A.x, top, "a ?", 0, -60);
  },
});
