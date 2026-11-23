import { body, type Story } from "../engine";
import { askLabel, askSpan, storySpec } from "../kits";

/**
 * 2016 q2: Atwood machine; basket A (heavier) falls from h. Experiment 1: h = 0.5, 1, 1.5 m with a ≈ 1 m/s² (drawn with
 * mA − mB = 0.1 kg and mA + mB = 1.017 kg, the total from experiment 2). Experiment 2: the same total, other differences.
 */
const g = 10, total = 1.017441860465116;
const run = (h: number, dm: number): Story => {
  const mA = (total + dm) / 2, mB = (total - dm) / 2, a = (dm * g) / total;
  return {
    init: { A: body(-0.25, h, 0, 0), B: body(0.25, 0.2, 0, 0) },
    // build 2: each basket with the string tension T
    phases: [{ end: "floor", acc: { A: [0, -a], B: [0, a] }, dur: () => Math.sqrt((2 * h) / a), force: () => { const T = (2 * mA * mB * g) / total; return { A: [0, (T - mA * g) / mA], B: [0, (T - mB * g) / mB] }; }, until: (s) => s.A.y <= 0 }],
    record: { a: ["floor", (s) => (s.A.vy * s.A.vy) / (2 * h)] },
  };
};
export const spec = storySpec({
  id: "bagrut-2016-q2",
  view: { x0: -2.4, x1: 2.4, y0: -0.15, y1: 2.25 },
  scale: 2,
  scenarios: { h1: run(0.5, 0.1), h2: run(1, 0.1), h3: run(1.5, 0.1), d2: run(1.5, 0.02), d4: run(1.5, 0.04), d6: run(1.5, 0.06) },
  order: { h1: ["floor"], h2: ["floor"], h3: ["floor"], d2: ["floor"], d4: ["floor"], d6: ["floor"] },
  answers: { "h2.floor": [1.4, 0.03], "h3.floor": [1.72, 0.03] },
  parts: [
    { to: (m) => m.events["h3.floor"], pace: 1, caption: "סל A הכבד יותר יורד, וסל B עולה. למה, לפי חוקי ניוטון, התאוצה קבועה?" },
    { to: (m) => m.events["h3.floor"], pace: 1, hideClock: true, caption: "מדדו את הגובה h ואת הזמן t עד שסל A פגע ברצפה. איך חישבו מהם את התאוצה?" },
    { to: (m) => m.events["h3.floor"], pace: 1, caption: "משחררים מגבהים שונים. האם התוצאות מבססות תאוצה קבועה?" },
    { to: (m) => m.events["d2.floor"], pace: 1, caption: "ניסוי 2: מעבירים משקולות בין הסלים, והמסה הכוללת נשארת. איך התאוצה תלויה בהפרש המסות?" },
    { to: (m) => m.events["d2.floor"], pace: 1, caption: "מה המשוואה שמקשרת בין התאוצה להפרש המסות?" },
    { to: (m) => m.events["d2.floor"], pace: 1, caption: "לפי הגרף והמשוואה: מה המסה הכוללת של הסלים?" },
  ],
  draw: (P, m, t, part) => {
    const keys = part < 3 ? ["h1", "h2", "h3"] : ["d2", "d4", "d6"];
    P.ground(0, -2.3, 2.3);
    keys.forEach((k, i) => {
      const ox = -1.5 + i * 1.5;
      const s = m.state(Math.min(t, m.events[`${k}.floor`]));
      const A = s[`${k}.A`], B = s[`${k}.B`];
      P.line(ox - 0.5, 2.2, ox + 0.5, 2.2, { tone: "line", w: 3 });
      P.pulley(ox, 2.05, 14);
      P.line(ox - 0.25, 2.05, ox - 0.25, A.y + 0.1, { tone: "line", w: 1.2 });
      P.line(ox + 0.25, 2.05, ox + 0.25, B.y + 0.1, { tone: "line", w: 1.2 });
      P.block(ox - 0.25, A.y, { wPx: 24, hPx: 16, label: "A" });
      P.block(ox + 0.25, B.y, { wPx: 20, hPx: 14, label: "B", tone: "b2" });
      if (part < 3 && part !== 0) P.mono(ox - 0.6, 0, `h = ${[0.5, 1, 1.5][i]} m`, { tone: "data", size: 10, dyPx: 14 });
    });
    if (part === 0) askLabel(P, -1.75, 1.0, "a = const ?", -10, 0);
    if (part === 1) { askSpan(P, -2.0, 0, 0.5, "h", 0); askLabel(P, 0, 2.2, "a = f(h, t) ?", 0, -6); }
    if (part === 2) askLabel(P, 0, 2.2, "?", 0, -6);
    if (part === 3) askLabel(P, 0, 2.2, "a(Δm) ?", 0, -6);
    if (part === 4) askLabel(P, 0, 2.2, "a = ?", 0, -6);
    if (part === 5) askLabel(P, 0, 2.2, "mA + mB = ?", 0, -6);
  },
});
