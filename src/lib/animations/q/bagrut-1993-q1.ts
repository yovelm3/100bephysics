import { body, type State } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1993 q1: on a planet, body A is thrown horizontally; its places at t = 0…4 s are on the grid (x = 3t, y = t², y down).
 * Part ב: at the same moment B falls freely and C is thrown at twice A's speed. y is drawn downward, as in the question.
 */
const v0 = 3, g = 2, T = 4;
const fly = (vx: number) => ({
  init: { b: body(0, 0, vx, 0) },
  phases: [{
    end: "t4",
    acc: { b: [0, -g] as [number, number] },
    dur: () => T,
    force: () => ({ b: [0, -g] as [number, number] }),
    until: (_s: State, t: number) => t >= T - 1e-9,
  }],
  record: { x4: ["t4", (s: State) => s.b.x] as [string, (s: State) => number], y4: ["t4", (s: State) => s.b.y] as [string, (s: State) => number] },
});
export const spec = storySpec({
  id: "bagrut-1993-q1",
  view: { x0: -1, x1: 26, y0: -17.5, y1: 1.5 },
  scale: 25,
  scenarios: { A: fly(v0), B: fly(0), C: fly(2 * v0) },
  order: { A: ["t4"], B: ["t4"], C: ["t4"] },
  answers: { "A.x4": [12, 1e-9], "A.y4": [-16, 1e-9], "C.x4": [24, 1e-9] },
  parts: [
    { to: () => T, pace: 1.2, caption: "בכל שנייה מסומן המקום של גוף א'. מה המהירות האופקית שבה הוא נזרק, ומה תאוצת הנפילה בכוכב?" },
    { to: () => T, pace: 1.2, caption: "גוף ב' משוחרר ממנוחה וגוף ג' נזרק במהירות כפולה, באותו רגע ומאותה נקודה. איפה יהיה כל אחד בכל שנייה?" },
    { to: () => T, pace: 1.2, caption: "וקטור המהירות של גוף א' בשני רגעים. לאן מכוון ההפרש בין שני הווקטורים?" },
  ],
  draw: (P, m, t, part) => {
    // the grid of the question: 1 m squares, x to the right, y downward
    for (let i = 0; i <= 26; i += 2) P.line(i, 0, i, -17, { tone: "soft", w: 0.8 });
    for (let j = 0; j <= 17; j += 2) P.line(0, -j, 26, -j, { tone: "soft", w: 0.8 });
    P.arrow(0, 0, 26.2, 0, { tone: "line", w: 1.6 }); P.arrow(0, 0, 0, -17.2, { tone: "line", w: 1.6 });
    P.mono(26.2, 0, "x (m)", { tone: "line", size: 12, anchor: "end", dyPx: -8 }); P.mono(0, -17.2, "y (m)", { tone: "line", size: 12, anchor: "start", dxPx: 6 });
    for (let i = 4; i <= 24; i += 4) P.mono(i, 0, String(i), { tone: "data", size: 11, dyPx: -6 });
    for (let j = 4; j <= 16; j += 4) P.mono(0, -j, String(j), { tone: "data", size: 11, anchor: "end", dxPx: -5, dyPx: 4 });
    const keys = part === 1 ? ["A", "B", "C"] : ["A"];
    const tones = { A: "body", B: "b2", C: "runner" } as const;
    for (const k of keys) {
      // the marked places at whole seconds so far
      for (let s = 0; s <= Math.min(t, T) + 1e-9; s++) { const p = m.state(s)[`${k}.b`]; P.circle(p.x, p.y, 4, { fill: tones[k as "A"] }); }
      const p = m.state(Math.min(t, T))[`${k}.b`];
      P.circle(p.x, p.y, 7, { fill: tones[k as "A"] });
      if (part === 1) P.mono(p.x, p.y, k === "A" ? "א'" : k === "B" ? "ב'" : "ג'", { tone: tones[k as "A"], size: 13, dxPx: 12, dyPx: -8 });
    }
    if (part === 0 && t >= T - 1e-9) { askLabel(P, 12, -2, "v₀ = ?", 0, 0); askLabel(P, 12, -4, "g = ?", 0, 0); }
    if (part === 2) {
      for (const [tt, lab] of [[1, "v₁"], [3, "v₂"]] as const) {
        if (t < tt) continue;
        const s = m.state(tt)["A.b"];
        P.arrowPx(s.x, s.y, s.vx * 12, -s.vy * 12, { tone: "vel", label: lab });
      }
      if (t >= 3) askLabel(P, 16, -8, "Δv = v₂ − v₁ : ?", 0, 0);
    }
  },
});
