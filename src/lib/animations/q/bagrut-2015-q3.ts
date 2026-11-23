import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2015 q3: Tami (50 kg) on a bathroom scale in an elevator. The scale shows 50, 47.5, 50, 52.5, 50 kg in the sections
 * A–E (until 3, 5, 9, 11, 13 s). The elevator is drawn from inside (it does not move on the screen), since its direction
 * and speed are asked; the model has its motion (down: −0.5 m/s² in B, +0.5 m/s² in D).
 */
const g = 10, m = 50;
const seg = (end: string, tEnd: number, a: number) => ({ end, acc: { e: [0, a] as [number, number] }, dur: (_s: unknown, t0: number) => tEnd - t0, force: () => ({ e: [0, a] as [number, number] }), until: (_s: unknown, t: number) => t >= tEnd - 1e-12 });
const READ = [[0, 50], [3, 50], [3, 47.5], [5, 47.5], [5, 50], [9, 50], [9, 52.5], [11, 52.5], [11, 50], [13, 50]] as const;
export const spec = storySpec({
  id: "bagrut-2015-q3",
  view: { x0: -4, x1: 4, y0: -0.4, y1: 3.6 },
  scale: 6,
  story: {
    init: { e: body(0, 0, 0, 0) },
    phases: [seg("A", 3, 0), seg("B", 5, -0.5), seg("C", 9, 0), seg("D", 11, 0.5), seg("E", 13, 0)],
    record: { readB: ["B", () => (m * (g - 0.5)) / g], vC: ["C", (s) => s.e.vy] },
  },
  order: ["A", "B", "C", "D", "E"],
  answers: { readB: [47.5, 1e-9] },
  parts: [
    { to: () => 13, pace: 0.5, caption: "תמי עומדת על המאזניים במעלית. איזה כוח המאזניים מראים?" },
    { to: () => 13, pace: 0.5, caption: "מה מצב המעלית בכל קטע, A עד E: מנוחה, מהירות קבועה או מהירות משתנה?" },
    { to: () => 13, pace: 0.5, caption: "מה גודל התאוצה של המעלית בקטע B, ומה בקטע D?" },
    { to: () => 13, pace: 0.5, caption: "האם המעלית עלתה, ירדה, או שאי אפשר לדעת?" },
    { to: () => 13, pace: 0.5, caption: "איך נראה גרף גודל המהירות של המעלית מ-0 עד 13 שניות?" },
  ],
  draw: (P, mm, t, part) => {
    // the scale's reading graph of the question, with a cursor
    const G = P.graph({ xPx: 40, yPx: 30, wPx: 330, hPx: 220, tMax: 15, vMin: 0, vMax: 60, xLabel: "t (s)", yLabel: "(kg)" });
    P.path(READ.map(([tt, r]) => [G.gx(tt), G.gy(r)] as [number, number]), { tone: "body", w: 2.4 });
    for (const tt of [5, 10, 15]) P.textPx(G.gx(tt), G.gy(0) + 13, String(tt), { tone: "data", size: 10 });
    for (const r of [10, 20, 30, 40, 50]) P.textPx(36, G.gy(r) + 4, String(r), { tone: "data", size: 10, anchor: "end" });
    for (const [lab, tt] of [["A", 1.5], ["B", 4], ["C", 7], ["D", 10], ["E", 12]] as const) P.textPx(G.gx(tt), G.gy(56), lab, { tone: "data", size: 11 });
    P.arrowScreen(G.gx(t), G.gy(0), G.gx(t), G.gy(58), { tone: "idle", w: 1 });
    // inside the elevator
    P.poly([[0.6, 0], [3.6, 0], [3.6, 3.3], [0.6, 3.3]], { fill: "none" });
    P.block(2.1, 0, { wPx: 50, hPx: 10, tone: "line" });
    P.person(2.1, 0.12, t, { tone: "runner" });
    void mm;
    if (part === 0) askLabel(P, 2.1, 0.1, "?", 40, 0);
    if (part === 1) askLabel(P, 2.1, 3.0, "?", 0, 0);
    if (part === 2) askLabel(P, 2.1, 3.0, "a = ?", 0, 0);
    if (part === 3) askLabel(P, 2.1, 3.0, "↑ ↓ ?", 0, 0);
    if (part === 4) askLabel(P, 2.1, 3.0, "|v|(t) ?", 0, 0);
  },
});
