import { askLabel, askSpan, graphMotion } from "../kits";

/** 1992 q1: an elevator by its velocity graph (seven sections A–G), up is positive, from the ground floor. */
export const spec = graphMotion({
  id: "bagrut-1992-q1",
  vertical: true,
  shape: "elevator",
  v: [[0, 0], [3, 3], [6, 3], [7, 0], [10, 0], [11, -2], [14, -2], [17, 0]],
  names: ["start", "AB", "BC", "CD", "DE", "EF", "FG", "end"],
  range: [0, 16.5],
  graph: { vMin: -3, vMax: 3.3, tTicks: [5, 10, 15], vTicks: [-2, -1, 1, 2, 3] },
  answers: { "x@CD": [15, 1e-9], "x@end": [5, 1e-9], "a@0": [1, 1e-9], "a@2": [-3, 1e-9], "a@4": [-2, 1e-9], "a@6": [0.6667, 1e-3] },
  parts: [
    { to: (m) => m.events.end, pace: 0.7, caption: "בכל קטע: האם המעלית עולה או יורדת, והאם המהירות שלה קבועה, גדלה או קטנה?" },
    { to: (m) => m.events.CD, pace: 0.7, caption: "המעלית עולה עד שהיא נעצרת. מה הגובה המרבי שאליו היא מגיעה?",
      ask: (P, m, t) => { if (t >= m.events.CD - 1e-9) askSpan(P, 0, 0, m.values["x@CD"], "H = ?", 50); } },
    { to: (m) => m.events.end, pace: 0.7, caption: "אחרי ההמתנה המעלית יורדת ונעצרת. באיזה גובה היא בסוף?",
      ask: (P, m, t) => { if (t >= m.events.end - 1e-9) askSpan(P, 0, 0, m.values["x@end"], "h = ?", 50); } },
    { to: (m) => m.events.end, pace: 0.7, caption: "על המאזניים במעלית מונח שק מלט. מה מראים המאזניים בכל קטע?",
      ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "? kg", 24, -10) },
  ],
});
