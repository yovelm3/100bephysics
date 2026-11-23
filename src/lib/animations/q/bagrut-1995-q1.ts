import { askLabel, graphMotion } from "../kits";

/** 1995 q1: positions every 0.02 s (table and x-t graph); constant acceleration of 12 m/s² from 0.48 m/s. */
const v0 = 0.48, a = 12, T = 0.22;
export const spec = graphMotion({
  id: "bagrut-1995-q1",
  panel: "x",
  xGraph: { xMin: 0, xMax: 0.42, label: "x (cm)", tTicks: [0.1, 0.2], xTicks: [[0.1, "10"], [0.2, "20"], [0.3, "30"], [0.4, "40"]] },
  strobe: { every: 0.02 },
  v: [[0, v0], [T, v0 + a * T]],
  names: ["start", "end"],
  range: [0, 0.42],
  graph: { vMin: 0, vMax: 3.5 },
  answers: { "x@end": [0.396, 1e-9], "a@0": [12, 1e-9] },
  parts: [
    { to: () => T, pace: 25, caption: "המקום של הגוף מסומן כל 0.02 s. האם המרחקים בין הסימנים גדלים, קטנים או שווים?" },
    { to: () => 0.04, pace: 25, caption: "מה המהירות ברגע t = 0.02 s? היעזרו בסימנים שלפני הרגע הזה ואחריו.",
      ask: (P, m, t) => { if (t >= 0.02) askLabel(P, m.state(0.02).b.x, 0, "v = ?", -12, -50); } },
    { to: () => T, pace: 25, caption: "באותה דרך מוצאים את המהירות ברגעים נוספים. איך היא משתנה?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "v = ?", -12, -50) },
    { to: () => T, pace: 25, caption: "מהמהירויות שמצאתם: איך נראה גרף המהירות כפונקציה של הזמן?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "v(t) ?", -12, -50) },
    { to: () => T, pace: 25, caption: "האם התאוצה קבועה? אם כן, מה היא?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "a = ?", -12, -50) },
    { to: () => T, pace: 25, caption: "אם ציר המקום היה מכוון הפוך לתנועה, האם הסימן של התאוצה היה משתנה?",
      ask: (P) => { P.arrow(0.4, 0.08, 0.25, 0.08, { tone: "ask", w: 2 }); P.mono(0.4, 0.08, "x", { tone: "ask", size: 13, dxPx: 10, dyPx: 4, anchor: "start" }); } },
  ],
});
