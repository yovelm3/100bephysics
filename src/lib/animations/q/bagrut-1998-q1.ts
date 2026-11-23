import { askLabel, askWidth, graphMotion } from "../kits";

/** 1998 q1: a body starts from rest; the velocity rises fast and then levels off near 0.5 m/s (graph from the measurements). */
const TV: [number, number][] = [[0, 0], [0.02, 0.15], [0.04, 0.26], [0.06, 0.335], [0.08, 0.385], [0.1, 0.415], [0.12, 0.44], [0.14, 0.455], [0.16, 0.47], [0.18, 0.475], [0.2, 0.48]];
export const spec = graphMotion({
  id: "bagrut-1998-q1",
  strobe: { every: 0.02 },
  v: TV,
  range: [0, 0.075],
  graph: { vMin: 0, vMax: 0.55, tTicks: [0.05, 0.1, 0.15, 0.2], vTicks: [0.1, 0.2, 0.3, 0.4, 0.5] },
  answers: { "x@c10": [0.0725, 0.001] },
  parts: [
    { to: () => 0.12, pace: 20, caption: "מהטבלה: המקום של הגוף כל 0.02 s. מה המהירות ברגע t = 0.08 s?",
      ask: (P, m, t) => { if (t >= 0.08) askLabel(P, m.state(0.08).b.x, 0, "v = ?", -12, -50); } },
    { to: () => 0.2, pace: 20, caption: "איזה מרחק עובר הגוף מההתחלה עד t = 0.2 s?",
      ask: (P, m, t) => { if (t >= 0.2 - 1e-9) askWidth(P, 0, m.state(0.2).b.x, 0, "d = ?", 30); } },
    { to: () => 0.02, pace: 40, caption: "מה התאוצה הממוצעת בשתי מאיות השנייה הראשונות?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "ā = ?", -12, -50) },
    { to: () => 0.2, pace: 20, caption: "המהירות גדלה כל הזמן. האם התאוצה גדלה, קטנה או לא משתנה?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "a ?", -12, -50) },
    { to: () => 0.2, pace: 20, caption: "האם הכוח השקול על הגוף גדל, קטן או לא משתנה?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "ΣF ?", -12, -50) },
    { to: () => 0.2, pace: 20, caption: "מה הכיוון של הכוח השקול: בכיוון התנועה, נגדה, או בניצב לה?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "ΣF ?", -12, -50) },
  ],
});
