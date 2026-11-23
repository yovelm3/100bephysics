import { askLabel, askSpan, graphMotion } from "../kits";

/**
 * 2014 q1: a skydiver's velocity graph (down positive): ~50·tanh(t/5) until 20 s, the parachute opens and the speed drops
 * to 10 m/s by 21.2 s, then settles at 4 m/s until landing at 55 s. The graph is drawn from many points of this curve.
 */
const vOf = (t: number) => (t < 20 ? 50 * Math.tanh(t / 5) : t < 21.2 ? 50 - ((t - 20) / 1.2) * 40 : 4 + 6 * Math.exp(-(t - 21.2) / 0.35));
const ts: number[] = [];
for (let i = 0; i <= 80; i++) ts.push((20 * i) / 80);
ts.push(21.2);
for (let i = 1; i <= 40; i++) ts.push(21.2 + 3 * (i / 40) ** 1.5);
for (let tt = 25; tt <= 55; tt += 5) ts.push(tt);
const v: [number, number][] = ts.map((tt) => [tt, -vOf(tt)]);
let H = 0;
for (let i = 0; i < v.length - 1; i++) H -= ((v[i][1] + v[i + 1][1]) / 2) * (v[i + 1][0] - v[i][0]);

export const spec = graphMotion({
  id: "bagrut-2014-q1",
  vertical: true,
  shape: "ball",
  x0: H,
  v,
  range: [0, H * 1.04],
  graph: { vMin: 0, vMax: 60, sign: -1, tTicks: [10, 20, 30, 40, 50], vTicks: [10, 20, 30, 40, 50, 60] },
  answers: { [`x@c${v.length - 1}`]: [0, 1e-6] },
  parts: [
    { to: () => 20, pace: 0.35, caption: "איך נע הצנחן מהקפיצה ועד 20 שניות? מה קורה למהירות ולתאוצה?", ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "?", 30, 0) },
    { from: () => 17, to: () => 25, pace: 1.2, caption: "בין 20 ל-25 שניות המהירות קטנה פתאום. מה הסיבה?", ask: (P, m, t) => { if (t >= 20) askLabel(P, 0, m.state(t).b.x, "?", 30, 0); } },
    { to: () => 20, pace: 0.35, caption: "איך מחשבים מהגרף את המרחק שהצנחן נפל עד שפתח את המצנח?", ask: (P, m, t) => { if (t >= 20 - 1e-9) askSpan(P, 0, H, m.state(20).b.x, "h = ?", -40); } },
    { to: () => 3, pace: 2, graphT: 6, caption: "בהתחלה הגרף כמעט קו ישר. איך מראים ממנו שתאוצת הנפילה בערך 10 m/s²?", ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "a = ?", 30, 0) },
    { to: () => 20, pace: 0.35, caption: "על הצנחן פועלים שני כוחות. איך משתנה כל אחד מהם עד 20 שניות?", ask: (P, m, t) => { const y = m.state(t).b.x; P.arrowPx(0, y, 0, 40, { tone: "force", label: "mg" }); P.arrowPx(0, y + H * 0.03, 0, -40, { tone: "ask", label: "?" }); } },
    { to: () => 55, pace: 0.2, caption: "m = 80 kg. מתי הכוח השקול על הצנחן הכי גדול, ומה גודלו?", ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "ΣF max = ?", 30, 0) },
  ],
});
