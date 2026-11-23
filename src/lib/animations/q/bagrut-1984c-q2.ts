import { graphMotion } from "../kits";

/** 1984 complement q2: the acceleration is positive, then zero, then negative; the body starts from rest. Which x(t) graph fits? */
export const spec = graphMotion({
  id: "bagrut-1984c-q2",
  panel: "a",
  v: [[0, 0], [1, 0.6], [2, 0.6], [3, 0]],
  names: ["start", "a1", "a2", "end"],
  range: [0, 1.25],
  graph: { vMin: -1, vMax: 1 },
  answers: { "a@0": [0.6, 1e-9], "a@1": [0, 1e-9], "a@2": [-0.6, 1e-9] },
  parts: [
    { to: (m) => m.events.end, pace: 2.2, caption: "הגוף יוצא ממנוחה ונע לפי גרף התאוצה. שימו לב איך המקום משתנה בכל שלב. איזה גרף מקום-זמן מתאים?" },
  ],
});
