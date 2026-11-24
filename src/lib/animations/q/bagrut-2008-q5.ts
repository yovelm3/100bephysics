import { body, type Story } from "../engine";
import { askLabel, joinSpecs, seg, storySpec, trackMotion } from "../kits";

/**
 * 2008 q5: spring A (100 N/m) and spring B (50 N/m). Pulled slowly (5 cm/s) until the pull is 50 N (A alone) or 25 N
 * (A then B). Part ד: A compressed 0.2 m pushes a 0.4 kg box (2 J); it climbs 0.2 m (smooth track) and reaches spring B
 * with 1.2 J, which compresses B by 0.219 m. The track story starts as the box leaves spring A.
 */
const kA = 100, kB = 50, u = 0.05;
const pull = (k: number, F: number): Story => ({ init: { h: body(0, 0, u, 0) }, phases: [{ end: "F", acc: {}, dur: () => F / k / u, force: () => ({}), until: (s) => k * s.h.x >= F }], record: { x: ["F", (s) => s.h.x] } });
const kS = 1 / (1 / kA + 1 / kB);
const springs = storySpec({
  id: "bagrut-2008-q5",
  view: { x0: -0.1, x1: 2.1, y0: -0.3, y1: 0.8 },
  scale: 1,
  scenarios: { A: pull(kA, 50), AB: pull(kS, 25) },
  order: { A: ["F"], AB: ["F"] },
  answers: { "A.x": [0.5, 1e-9], "AB.x": [0.75, 1e-9] },
  parts: [
    { to: (m) => m.events["A.F"], pace: 0.4, caption: "K1 = 100 N/m. מה המשמעות של הנתון הזה?" },
    { to: (m) => m.events["A.F"], pace: 0.4, caption: "שני תלמידים מושכים את שני הקצוות של קפיץ א, כל אחד ב-50 N. מה ההתארכות?" },
    { to: (m) => m.events["AB.F"], pace: 0.4, caption: "קפיץ א קשור לקיר וקפיץ ב בהמשכו; מושכים את ב ב-25 N. מה ההתארכות של קפיץ א?" },
    { to: (m) => m.events["AB.F"], pace: 0.4, caption: "ומה ההתארכות של קפיץ ב?" },
  ],
  draw: (P, m, t, part) => {
    const L0 = 0.6, series = part >= 2;
    const x = m.state(t)[series ? "AB.h" : "A.h"].x, f = (series ? kS : kA) * x;
    if (part === 1) { P.circle(0.05, 0.2, 6, { fill: "runner" }); P.arrowPx(0.05, 0.2, -10 - f * 0.4, 0, { tone: "force", label: "F" }); P.spring(0.05, 0.2, 0.05 + L0 + x, 0.2, { coils: 10, ampPx: 7 }); P.circle(0.05 + L0 + x, 0.2, 6, { fill: "runner" }); P.arrowPx(0.05 + L0 + x, 0.2, 10 + f * 0.4, 0, { tone: "force", label: "F" }); }
    else {
      P.wall(0, -0.1, 0.5, "left");
      const xa = f / kA, xb = series ? f / kB : 0;
      P.spring(0, 0.2, L0 + xa, 0.2, { coils: 10, ampPx: 7 });
      if (series) P.spring(L0 + xa, 0.2, 2 * L0 + xa + xb, 0.2, { coils: 10, ampPx: 5 });
      const end = series ? 2 * L0 + xa + xb : L0 + xa;
      P.circle(end, 0.2, 6, { fill: "runner" }); P.arrowPx(end, 0.2, 10 + f * 0.8, 0, { tone: "force", label: "F" });
      P.mono(L0 / 2, 0.2, "א", { tone: "data", size: 11, dyPx: -14 }); if (series) P.mono(1.5 * L0 + xa, 0.2, "ב", { tone: "data", size: 11, dyPx: -14 });
    }
    const done = t >= m.events[series ? "AB.F" : "A.F"] - 1e-9;
    if (part === 0) askLabel(P, 1.2, 0.6, "K = 100 ?", 0, 0);
    if (part === 1 && done) askLabel(P, 1.2, 0.6, "Δℓ = ?", 0, 0);
    if (part === 2 && done) askLabel(P, 0.3, 0.2, "Δℓ = ?", 0, -26);
    if (part === 3 && done) askLabel(P, 0.95, 0.2, "Δℓ = ?", 0, -26);
  },
});
const v0 = Math.sqrt((2 * 0.5 * kA * 0.04) / 0.4);
const qb = (p0: number[], p1: number[], p2: number[], n: number) => Array.from({ length: n }, (_, i) => { const w = (i + 1) / n; return [(1 - w) ** 2 * p0[0] + 2 * (1 - w) * w * p1[0] + w * w * p2[0], (1 - w) ** 2 * p0[1] + 2 * (1 - w) * w * p1[1] + w * w * p2[1]] as [number, number]; });
const path: [number, number][] = [[0, 0], ...seg([0, 0], [0.6, 0], 30), ...qb([0.6, 0], [0.85, 0], [0.95, 0.1], 100), ...qb([0.95, 0.1], [1.05, 0.2], [1.3, 0.2], 100), ...seg([1.3, 0.2], [1.9, 0.2], 30)];
const box = trackMotion({
  id: "bagrut-2008-q5",
  path,
  v0,
  view: { x0: -0.45, x1: 2.25, y0: -0.25, y1: 0.85 },
  bare: true,
  answers: { vEnd: [Math.sqrt(2 * 1.2 / 0.4), 1e-3] },
  parts: [{ to: (m) => m.events.end, pace: 1, caption: "קפיץ א מכווץ 0.2 m דוחף תיבה של 0.4 ק\"ג. האם היא מגיעה לקפיץ ב? אם כן, בכמה תכווץ אותו?" }],
  extra: (P, m, t) => {
    P.poly(path, { close: false, fill: "none", tone: "line", w: 2.4 });
    P.wall(-0.4, -0.05, 0.3, "left"); P.spring(-0.4, 0.06, -0.05, 0.06, { coils: 8, ampPx: 5 });
    P.wall(2.2, 0.15, 0.5, "right"); P.spring(1.9, 0.26, 2.2, 0.26, { coils: 8, ampPx: 5 });
    for (const [l, x, y] of [["A", -0.4, 0], ["B", 0.6, 0], ["C", 1.3, 0.2], ["D", 2.2, 0.2]] as const) P.mono(x, y, l, { tone: "data", size: 11, dyPx: 16 });
    const b = m.state(t).b;
    P.block(b.x, b.y, { wPx: 20, hPx: 14 });
    if (t >= m.events.end - 1e-9) askLabel(P, 2.05, 0.26, "Δx = ?", 0, -26);
  },
});
export const spec = joinSpecs("bagrut-2008-q5", [{ key: "s", spec: springs, parts: [0, 1, 2, 3] }, { key: "box", spec: box, parts: [0] }]);
