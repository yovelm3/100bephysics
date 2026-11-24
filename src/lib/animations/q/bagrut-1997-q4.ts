import { askLabel, trackMotion } from "../kits";

/**
 * 1997 q4: a smooth track ABCD; at A (1 m above C's level) the speed is 1 m/s; D is 1.5 m high. The body cannot pass
 * D: it rises to 1.05 m and comes back. The track drawn: smooth curves through A, C and D; the story ends just below
 * the highest point it reaches.
 */
const qb = (p0: number[], p1: number[], p2: number[], n: number) => Array.from({ length: n }, (_, i) => { const u = (i + 1) / n; return [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]] as [number, number]; });
const A: [number, number] = [0, 1], C: [number, number] = [2, 0], D: [number, number] = [4.2, 1.5];
const full: [number, number][] = [A, ...qb(A, [1.1, 1.0], [1.4, 0.4], 200), ...qb([1.4, 0.4], [1.7, 0], C, 200), ...qb(C, [3.0, 0], [3.5, 1.0], 200), ...qb([3.5, 1.0], [3.8, 1.5], D, 200)];
const yMax = 1 + 1 / 20; // where the speed would be zero
const end = full.findIndex((p, i) => i > 400 && p[1] >= yMax * 0.985);
export const spec = trackMotion({
  id: "bagrut-1997-q4",
  path: full,
  v0: 1,
  endIndex: end,
  dt: 1e-5,
  points: { C: 400 },
  view: { x0: -0.3, x1: 4.6, y0: -0.3, y1: 2.15 },
  bare: true,
  answers: { "v@C": [4.58257569495584, 2e-3] },
  parts: [
    { to: (m) => m.events.C, pace: 1.5, caption: "ב-A המהירות 1 m/s. מה גודל המהירות בנקודה C?" },
    { to: (m) => m.events.end, pace: 1.5, caption: "האם הגוף יעבור את הנקודה D?" },
    { to: (m) => m.events.end, pace: 1.5, caption: "על כוכב לכת אחר: האם התשובה הקודמת הייתה יכולה להשתנות?" },
    { to: (m) => m.events.C, pace: 1.5, caption: "מה העבודה של הכוח הנורמלי מ-A ל-C?" },
    { to: (m) => m.events.C, pace: 1.5, caption: "בקטע ישר ומשופע מ-A ל-C במקום הקטע העקום: האם העבודה של כוח הכובד גדולה, קטנה או שווה?" },
  ],
  extra: (P, m, t, part) => {
    P.poly(full, { close: false, fill: "none", tone: "line", w: 2.4 });
    P.line(-0.2, 0, 4.5, 0, { tone: "idle", w: 1, dash: "4 4" });
    for (const [l, p] of [["A", A], ["C", C], ["D", D]] as const) P.mono(p[0], p[1], l, { tone: "data", size: 12, dyPx: l === "C" ? 16 : -10 });
    if (part === 4) P.line(A[0], A[1], C[0], C[1], { tone: "soft", w: 2, dash: "6 4" });
    const b = m.state(t).b;
    P.circle(b.x, b.y + 0.04, 7, { fill: "body" });
    if (Math.hypot(b.vx, b.vy) > 0.05) P.arrowPx(b.x, b.y + 0.04, b.vx * 9, -b.vy * 9, { tone: "vel", label: "v" });
    if (part === 0 && t >= m.events.C - 1e-9) askLabel(P, C[0], 0, "v = ?", 16, -24);
    if (part === 1 || part === 2) askLabel(P, D[0], D[1], "?", -20, -10);
    if (part === 3) askLabel(P, b.x, b.y, "W(N) = ?", 16, -24);
    if (part === 4) askLabel(P, 1, 0.5, "W(mg) ?", -20, 0);
  },
});
