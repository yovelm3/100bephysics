import { askLabel, askWidth, graphMotion } from "../kits";

/** 2011 q1: a ticker-tape timer marks the cart every 0.02 s from M to N (cm: 0, 0.5, 1.2, …, 7.7); constant acceleration 5 m/s². */
export const spec = graphMotion({
  id: "bagrut-2011-q1",
  panel: "none",
  strobe: { every: 0.02 },
  v: [[0, 0.2], [0.16, 0.2 + 5 * 0.16]],
  names: ["M", "P"],
  range: [0, 0.1],
  marks: [[0, "M"], [0.045, "A"], [0.077, "N"]],
  graph: { vMin: 0, vMax: 1.1 },
  shape: "cart",
  answers: { "x@P": [0.096, 1e-9], "a@0": [5, 1e-9] },
  parts: [
    { to: () => 0.14, pace: 18, caption: "הסימנים על הסרט נעשים כל 0.02 s. האם התנועה במהירות קבועה או בתאוצה?" },
    { to: () => 0.14, pace: 18, caption: "מה המהירות הממוצעת בקטע MN?", ask: (P, m, t) => { if (t >= 0.14 - 1e-9) askWidth(P, 0, 0.077, 0, "v̄ = ?", 34); } },
    { to: () => 0.12, pace: 18, caption: "מה המהירות הרגעית בנקודה A? היעזרו בסימנים שלפניה ואחריה.", ask: (P, m, t) => { if (t >= 0.1) askLabel(P, 0.045, 0, "v = ?", -14, -50); } },
    { to: () => 0.14, pace: 18, caption: "אם התאוצה קבועה, מה היא?", ask: (P, m, t) => askLabel(P, m.state(t).b.x, 0, "a = ?", -14, -50) },
    { to: () => 0.16, pace: 18, caption: "מה המרחק בין N לסימן הבא, P, שלא מופיע בתרשים?", ask: (P, m, t) => { if (t >= 0.16 - 1e-9) askWidth(P, 0.077, m.state(0.16).b.x, 0, "?", 34); } },
  ],
});
