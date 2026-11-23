import { askLabel, askSpan, flash, graphMotion } from "../kits";

/** 1984 q1: a weather rocket: engines until 10 s, coasts up to the top at 30 s, then comes down with a helper engine at 0.05 m/s². */
const H = 3000, a = 0.05, tDown = Math.sqrt((2 * H) / a);
export const spec = graphMotion({
  id: "bagrut-1984-q1",
  vertical: true,
  v: [[0, 0], [10, 200], [30, 0], [30 + tDown, -a * tDown]],
  names: ["launch", "burnout", "top", "land"],
  range: [0, 3300],
  graph: { vMin: -30, vMax: 220, tTicks: [10, 20, 30], vTicks: [100, 200], ghost: [[0, 0], [10, 200], [30, 0], [45, -0.75]] },
  answers: { "x@top": [3000, 1e-6], "x@land": [0, 1e-6], land: [376.4, 0.05] },
  parts: [
    { to: (m) => m.events.burnout + 6, pace: 0.6, graphT: 47, hideClock: true, caption: "המנועים פועלים והרקטה מאיצה. מתי נגמר הדלק?",
      ask: (P, m, t) => { if (t >= m.events.burnout) askLabel(P, 0, m.values["x@burnout"], "t = ?"); } },
    { to: (m) => m.events.top + 4, pace: 0.6, graphT: 47, hideClock: true, caption: "בלי דלק הרקטה ממשיכה לעלות ומאטה. מתי היא בגובה המרבי?",
      ask: (P, m, t) => { if (t >= m.events.top) askLabel(P, 0, m.values["x@top"], "t = ?"); } },
    { to: (m) => m.events.top, pace: 0.6, graphT: 47, caption: "לאיזה גובה עולה הרקטה?",
      ask: (P, m, t) => { if (t >= m.events.top - 1e-9) askSpan(P, 0, 0, m.values["x@top"], "H = ?", -40); flash(P, t, m.events.burnout, 0, 400, "הדלק נגמר", 4); } },
    { to: (m) => m.events.land, pace: 0.03, hideClock: true, caption: "מהגובה המרבי מנוע עזר מוריד את הרקטה בתאוצה קבועה קטנה. מתי היא חוזרת לקרקע, מהשיגור?",
      ask: (P, m, t) => { flash(P, t, m.events.top, 0, 2500, "מנוע העזר מופעל", 40); if (t >= m.events.land - 1e-9) askLabel(P, 0, 0, "t = ?", 18, -30); } },
    { to: (m) => m.events.land, pace: 0.03, caption: "גוף תלוי על דינמומטר בתוך הרקטה. מה מראה הדינמומטר בכל שלב: בזמן ההאצה, אחרי שהדלק נגמר, ובירידה?",
      ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "T = ?", 18, 20) },
  ],
});
