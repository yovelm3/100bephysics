import { askLabel, askWidth, graphMotion } from "../kits";

/** 1988 q1: a body on a line by the velocity graph; at t = 0 it is at A and moves right. */
export const spec = graphMotion({
  id: "bagrut-1988-q1",
  v: [[0, 2], [2, 4], [5, 4], [10, -6], [17, 1]],
  names: ["start", "c1", "c2", "c3", "end"],
  range: [-6, 23],
  marks: [[0, "A"]],
  graph: { vMin: -6.5, vMax: 4.5, tTicks: [2, 5, 10, 17], vTicks: [4, -6, 1, 2] },
  answers: { turn0: [7, 1e-9], "x@turn0": [22, 1e-6], turn1: [16, 1e-9], "x@turn1": [-5, 1e-6], "a@0": [1, 1e-9], "a@2": [-2, 1e-9], "a@3": [1, 1e-9] },
  parts: [
    { to: (m) => m.events.end, pace: 0.8, caption: "בכל קטע של הגרף המהירות משתנה בקצב אחר. מה התאוצה בכל קטע?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "a = ?", -20, -70) },
    { to: (m) => m.events.turn0 + 1.5, pace: 0.8, hideClock: true, caption: "הגוף מתרחק ימינה מהנקודה A. מתי הוא הכי רחוק מימינה?",
      ask: (P, m, t) => { if (t >= m.events.turn0) askLabel(P, m.values["x@turn0"], 0, "t = ?", -20, -70); } },
    { to: (m) => m.events.turn0, pace: 0.8, caption: "מה המרחק הגדול ביותר מימין לנקודה A?",
      ask: (P, m, t) => { if (t >= m.events.turn0 - 1e-9) askWidth(P, 0, m.values["x@turn0"], 0, "d = ?", 30); } },
    { to: (m) => m.events.end, pace: 0.8, hideClock: true, caption: "אחרי שהגוף חוזר שמאלה הוא עובר את A. מה המרחק הגדול ביותר משמאל ל-A, ומתי?",
      ask: (P, m, t) => { if (t >= m.events.turn1 - 1e-9) askWidth(P, m.values["x@turn1"], 0, 0, "d = ?  t = ?", 30); } },
  ],
});
