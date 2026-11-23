import { askLabel, graphMotion } from "../kits";

/** 1996 q1: a body starts moving right at t = 0, by the velocity graph up to t = 25 s. */
export const spec = graphMotion({
  id: "bagrut-1996-q1",
  v: [[0, 0], [5, 10], [8, 10], [20, -5], [25, 0]],
  names: ["start", "c1", "c2", "c3", "end"],
  range: [-3, 100],
  marks: [[0, "0"]],
  graph: { vMin: -6, vMax: 11, tTicks: [5, 10, 15, 20, 25], vTicks: [-5, 5, 10] },
  answers: { turn0: [16, 1e-9], "x@turn0": [95, 1e-6], "x@end": [72.5, 1e-6], "a@2": [-1.25, 1e-9] },
  parts: [
    { to: (m) => m.events.end, pace: 0.4, hideClock: true, caption: "האם הגוף משנה את כיוון התנועה? אם כן, מתי?",
      ask: (P, m, t) => { if (t >= m.events.turn0) askLabel(P, m.values["x@turn0"], 0, "t = ?", -16, -60); } },
    { to: (m) => m.events.end, pace: 0.4, caption: "בכל קטע המהירות משתנה בקצב אחר. מה התאוצה בכל קטע?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "a = ?", -16, -60) },
    { to: (m) => m.events.end, pace: 0.4, caption: "האם הגוף חוזר לנקודה שממנה יצא? אם כן, מתי?",
      ask: (P, m, t) => { if (t >= m.events.end - 1e-9) askLabel(P, 0, 0, "חוזר?", -16, -60); } },
    { to: (m) => m.events.c1, pace: 0.4, caption: "בחמש השניות הראשונות: מה הכיוון של המהירות, של התאוצה ושל הכוח השקול?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "v? a? ΣF?", -30, -60) },
    { from: (m) => m.events.c1, to: (m) => m.events.end, pace: 0.4, caption: "מ-5 עד 25 שניות: חלקו לפרקי זמן לפי הכיוונים של המהירות, התאוצה והכוח השקול.",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "v? a? ΣF?", -30, -60) },
    { to: (m) => m.events.turn0, pace: 0.4, caption: "ברגע t = 16 s הגוף נעצר לרגע. מה התאוצה שלו ברגע הזה?",
      ask: (P, m, t) => { if (t >= m.events.turn0 - 1e-9) askLabel(P, m.values["x@turn0"], 0, "a = ?", -16, -60); } },
  ],
});
