import { askLabel, graphMotion, joinSpecs, trackMotion } from "../kits";

/** 1999 q1: a cart down a frictionless slope, measured every 0.02 s (5 m/s² from 0.4 m/s); part ה: down a curved track from rest. */
const slope = graphMotion({
  id: "bagrut-1999-q1",
  panel: "none",
  strobe: { every: 0.02 },
  v: [[0, 0.4], [0.12, 0.4 + 5 * 0.12]],
  names: ["start", "end"],
  range: [0, 0.09],
  graph: { vMin: 0, vMax: 1.1 },
  shape: "cart",
  answers: { "x@end": [0.084, 1e-9], "a@0": [5, 1e-9] },
  parts: [
    { to: () => 0.08, pace: 25, caption: "המקום של הקרונית כל 0.02 s, כמו בטבלה. מה המהירות ברגע t = 0.06 s?",
      ask: (P, m, t) => { if (t >= 0.06) askLabel(P, m.state(0.06).b.x, 0, "v = ?", -12, -50); } },
    { to: () => 0.12, pace: 25, caption: "באותה דרך: מה המהירות ברגעים 0.02, 0.04, 0.08 ו-0.10 שניות?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "v = ?", -12, -50) },
    { to: () => 0.12, pace: 25, caption: "מהמהירויות שמצאתם: איך נראה גרף המהירות כפונקציה של הזמן?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "v(t) ?", -12, -50) },
    { to: () => 0.12, pace: 25, caption: "האם התאוצה של הקרונית קבועה? אם כן, מה היא?",
      ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "a = ?", -12, -50) },
  ],
});
// the curved track of part ה: steep at the top, almost flat at the bottom (the drawing of the question, 1 px = 1 cm)
const bez = (u: number): [number, number] => {
  const P0 = [60, 120], P1 = [190, 352], P2 = [620, 352];
  const x = (1 - u) ** 2 * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0];
  const y = (1 - u) ** 2 * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1];
  return [(x - 60) / 100, (366 - y) / 100];
};
const curve = trackMotion({
  id: "bagrut-1999-q1",
  path: Array.from({ length: 201 }, (_, i) => bez(i / 200)),
  view: { x0: -0.3, x1: 5.9, y0: -0.3, y1: 2.8 },
  answers: { vEnd: [Math.sqrt(2 * 10 * 2.32), 0.01] },
  parts: [{ to: (m) => m.events.end, pace: 2.5, caption: "הקרונית יוצאת ממנוחה ויורדת במסלול עקום, בלי חיכוך. איזה גרף מתאר את גודל המהירות כפונקציה של הזמן?",
    ask: (P, m, t) => askLabel(P, m.state(t).b.x, m.state(t).b.y, "v(t) ?", 10, -24) }],
  extra: (P) => P.ground(0.14, -0.2, 5.8),
});
export const spec = joinSpecs("bagrut-1999-q1", [{ key: "slope", spec: slope, parts: [0, 1, 2, 3] }, { key: "curve", spec: curve, parts: [0] }]);
