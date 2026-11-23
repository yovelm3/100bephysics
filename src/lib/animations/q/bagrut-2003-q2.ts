import { askLabel, graphMotion } from "../kits";

/**
 * 2003 q2: the body's velocity graph on a rough slope (up positive): 8 m/s up, stopping at 2 s, then sliding back to
 * the bottom at 6 s (−4 m/s). From the graph: sin α = 0.25, so the slope is drawn at about 14.5°.
 */
const al = Math.asin(0.25);
const len = 11;
export const spec = graphMotion({
  id: "bagrut-2003-q2",
  v: [[0, 8], [2, 0], [6, -4]],
  names: ["start", "top", "bottom"],
  range: [-1, 12],
  along: [[0, 0], [len * Math.cos(al), len * Math.sin(al)]],
  graph: { vMin: -4.5, vMax: 8.5, tTicks: [2, 6], vTicks: [8, -4] },
  answers: { "a@0": [-4, 1e-9], "a@1": [-1, 1e-9], "x@bottom": [0, 1e-9] },
  parts: [
    { to: (m) => m.events.bottom, pace: 0.7, caption: "הגוף עולה במדרון, נעצר וחוזר לתחתית. מה התאוצה בעלייה ומה בירידה?", ask: (P, m, t) => { const d = m.state(t).b.x; askLabel(P, d * Math.cos(al), d * Math.sin(al), "a = ?", 0, -40); } },
    { to: (m) => m.events.bottom, pace: 0.7, caption: "אילו כוחות פועלים על הגוף בעלייה, ואילו בירידה?", ask: (P, m, t) => { const d = m.state(t).b.x; askLabel(P, d * Math.cos(al), d * Math.sin(al), "?", 0, -40); } },
    { to: (m) => m.events.bottom, pace: 0.7, caption: "מה הביטויים לתאוצה בעלייה ובירידה, לפי μ, α ו-g?", ask: (P, m, t) => { const d = m.state(t).b.x; askLabel(P, d * Math.cos(al), d * Math.sin(al), "a(μ, α, g) ?", 0, -40); } },
    { to: (m) => m.events.bottom, pace: 0.7, caption: "הירידה לוקחת יותר זמן מהעלייה. למה?", ask: (P, m, t) => { if (t >= 2) { const d = m.state(t).b.x; askLabel(P, d * Math.cos(al), d * Math.sin(al), "?", 0, -40); } } },
  ],
  extra: (P) => {
    P.line(-0.5, 0, len * Math.cos(al), 0, { tone: "line", w: 2 });
    P.line(len * Math.cos(al), 0, len * Math.cos(al), len * Math.sin(al), { tone: "line", w: 2 });
    P.mono(1.6, 0, "α", { tone: "data", size: 12, dyPx: -5 });
  },
});
