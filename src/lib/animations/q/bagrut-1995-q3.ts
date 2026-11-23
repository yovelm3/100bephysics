import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1995 q3: a plane where the only force is a constant F in +x (F = 1.6 N, m = 0.2 kg, a = 8 m/s²).
 * Body 1 starts at the origin moving in −x (drawn at 24 m/s); body 2 starts moving in +y at 24 m/s.
 * Parts that ask for the path's shape or the speed show only the first moments, so the answer is not drawn.
 */
const a = 1.6 / 0.2, v0 = 24, T = 4;
const shortT = 0.25;
export const spec = storySpec({
  id: "bagrut-1995-q3",
  view: { x0: -75, x1: 125, y0: -12, y1: 100 },
  scale: 100,
  // the short windows are zoomed in on the start
  views: [0, 1, 2, 3, 4, 5].map((i) => ([1, 5].includes(i) ? { x0: -75, x1: 125, y0: -12, y1: 100 } : { x0: -14, x1: 14, y0: -2.5, y1: 11.5 })),
  scenarios: {
    one: {
      init: { b: body(0, 0, -v0, 0) },
      phases: [
        { end: "turn", acc: { b: [a, 0] }, dur: (s) => -s.b.vx / a, force: () => ({ b: [1.6 / 0.2, 0] }), until: (s) => s.b.vx >= 0 },
        { end: "end", acc: { b: [a, 0] }, dur: (_s, t0) => T - t0, force: () => ({ b: [1.6 / 0.2, 0] }), until: (_s, t) => t >= T - 1e-12 },
      ],
    },
    two: {
      init: { b: body(0, 0, 0, v0) },
      phases: [{ end: "end", acc: { b: [a, 0] }, dur: () => T, force: () => ({ b: [1.6 / 0.2, 0] }), until: (_s, t) => t >= T - 1e-12 }],
      record: { x4: ["end", (s) => s.b.x], y4: ["end", (s) => s.b.y] },
    },
  },
  order: { one: ["turn", "end"], two: ["end"] },
  answers: { "two.x4": [64, 1e-9], "two.y4": [96, 1e-9] },
  parts: [
    { to: () => shortT, pace: 6, caption: "גוף 1 יוצא מהראשית בכיוון השלילי של x, והכוח היחיד F בכיוון החיובי. מה צורת המסלול?" },
    { to: () => T, pace: 1, caption: "מה הכיוון של התאוצה בזמן התנועה?" },
    { to: () => shortT, pace: 6, caption: "האם גודל המהירות של גוף 1 גדל, קטן או לא משתנה? התייחסו לשלבים שונים בתנועה." },
    { to: () => shortT, pace: 6, caption: "גוף 2 יוצא מהראשית בכיוון החיובי של y. מה צורת המסלול שלו?" },
    { to: () => shortT, pace: 6, caption: "האם גודל המהירות של גוף 2 גדל, קטן או לא משתנה?" },
    { to: () => T, pace: 1, caption: "v₀ = 24 m/s, F = 1.6 N, m = 0.2 kg. איפה גוף 2 ברגע t = 4 s?" },
  ],
  draw: (P, m, t, part) => {
    const big = part === 1 || part === 5, X1 = big ? 120 : 13, Y1 = big ? 98 : 11;
    P.arrow(big ? -70 : -13, 0, X1, 0, { tone: "line", w: 1.2 }); P.mono(X1, 0, "x", { tone: "text", size: 12, dyPx: 16 });
    P.arrow(0, big ? -10 : -2, 0, Y1, { tone: "line", w: 1.2 }); P.mono(0, Y1, "y", { tone: "text", size: 12, dxPx: 12 });
    const key = part >= 3 ? "two" : "one";
    const b = m.state(t)[`${key}.b`];
    if (part === 1 || part === 5) {
      const path = Array.from({ length: 41 }, (_, i) => { const q = m.state((t * i) / 40)[`${key}.b`]; return [q.x, q.y] as [number, number]; });
      P.poly(path, { close: false, fill: "none", tone: "soft", w: 1.6, dash: "4 4" });
    }
    P.ball(b.x, b.y, { rPx: 7 });
    P.arrowPx(b.x, b.y, 50, 0, { tone: "force", label: "F" });
    const zoom = !(part === 1 || part === 5) ? 0.25 : 1;
    if (part !== 2 && part !== 4) P.arrowPx(b.x, b.y, b.vx * 1.6 * zoom * 4, -b.vy * 1.6 * zoom * 4, { tone: "vel", label: "v" });
    else P.arrowPx(b.x, b.y, (key === "one" ? -v0 : 0) * 1.6, -(key === "two" ? v0 : 0) * 1.6, { tone: "vel", label: "v₀" });
    if (part === 0 || part === 3) askLabel(P, b.x, b.y, "?", 20, -30);
    if (part === 1) askLabel(P, b.x, b.y, "a⃗ ?", 20, -30);
    if (part === 2 || part === 4) askLabel(P, b.x, b.y, "|v| ?", 20, -30);
    if (part === 5 && t >= T - 1e-9) askLabel(P, b.x, b.y, "(x, y) = ?", 14, 0);
  },
});
