import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2005 q4: A on a smooth surface, tied over a pulley (at its left) to B hanging; the student pulls A right with F.
 * The table: F = 3…5.5 N, a = 1.5…6 m/s². The trend line a = (F − mB·g)/(mA + mB) gives mB and mA + mB.
 * Each experiment runs 0.4 s. Part ה: A heavier (twice, drawn).
 */
const g = 10, F = [3, 3.5, 4, 4.5, 5, 5.5], A_ = [1.5, 2.5, 3.5, 4, 5, 6];
const n = 6, Fm = F.reduce((a, b) => a + b) / n, am = A_.reduce((a, b) => a + b) / n;
const slope = F.reduce((acc, f, i) => acc + (f - Fm) * (A_[i] - am), 0) / F.reduce((acc, f) => acc + (f - Fm) ** 2, 0);
const F0 = Fm - am / slope, mB = F0 / g, mAll = 1 / slope, mA = mAll - mB;
const run = (f: number, massA: number): Story => ({
  init: { A: body(0, 0, 0, 0), B: body(0, 0, 0, 0) },
  phases: [{
    end: "end",
    acc: { A: [(f - mB * g) / (massA + mB), 0], B: [0, (f - mB * g) / (massA + mB)] },
    dur: () => 0.4,
    // build 2: A pulled by F and the string T; B by T and its weight
    force: () => { const T = (massA * mB * g + mB * f) / (massA + mB); return { A: [(f - T) / massA, 0], B: [0, (T - mB * g) / mB] }; },
    until: (_s, t) => t >= 0.4 - 1e-12,
  }],
  record: { T: ["end", (s) => mB * (g + s.B.vy / 0.4)] },
});
const scen: Record<string, Story> = Object.fromEntries([...F.map((f, i) => [`e${i}`, run(f, mA)]), ...F.map((f, i) => [`h${i}`, run(f, 2 * mA)])]);
scen.six = run(6, mA);
export const spec = storySpec({
  id: "bagrut-2005-q4",
  view: { x0: -0.15, x1: 1.65, y0: -0.62, y1: 0.28 },
  scale: 1,
  scenarios: scen,
  order: Object.fromEntries(Object.keys(scen).map((k) => [k, ["end"]])),
  answers: { "six.T": [3.5252459016393445, 0.01] },
  parts: [
    { to: () => 0.4, pace: 4, caption: "בכל ניסוי התלמיד מושך בכוח אחר ומודד את התאוצה. איך נראה גרף התאוצה כפונקציה של הכוח?" },
    { to: () => 0.4, pace: 4, caption: "הגרף חותך את ציר הכוח. מה המשמעות של נקודת החיתוך?" },
    { to: () => 0.4, pace: 4, caption: "מה המסה של B, לפי הגרף?" },
    { to: () => 0.4, pace: 4, caption: "מה הייתה המתיחות בחוט אילו התלמיד היה מושך בכוח של 6 N?" },
    { to: () => 0.4, pace: 4, caption: "עכשיו A כבד יותר. איך ישתנה הגרף?" },
  ],
  draw: (P, m, t, part) => {
    const heavy = part === 4;
    const rows = part === 3 ? ["six"] : F.map((_, i) => `${heavy ? "h" : "e"}${i}`);
    // the table of the question
    F.forEach((f, i) => { P.textPx(470 + i * 36, 40, String(f), { tone: "data", size: 11 }); P.textPx(470 + i * 36, 64, String(A_[i]), { tone: "data", size: 11 }); });
    P.textPx(430, 40, "F (N)", { tone: "text", size: 11, anchor: "end" });
    P.textPx(430, 64, "a (m/s²)", { tone: "text", size: 11, anchor: "end" });
    rows.forEach((k, i) => {
      const y = -0.1 * i;
      const b = m.state(t)[`${k}.A`];
      const f = k === "six" ? 6 : F[i];
      P.line(0, y, 1.4, y, { tone: "line", w: 1 });
      P.block(0.25 + b.x, y, { wPx: heavy ? 34 : 24, hPx: 14, tone: heavy ? "b2" : "body" });
      P.line(0.04, y + 0.03, 0.25 + b.x - 0.02, y + 0.03, { tone: "line", w: 1 });
      P.circle(0.03, y + 0.02, 3, { fill: "line" });
      // B hangs under the pulley (drawn at 1/10 of its rise, to keep the rows apart)
      const bB = m.state(t)[`${k}.B`], by = y - 0.075 + 0.1 * bB.y;
      P.line(0.015, y + 0.02, 0.015, by + 0.01, { tone: "line", w: 1 });
      P.block(0.015, by, { wPx: 12, hPx: 12, base: false, tone: "runner" });
      P.arrowPx(0.25 + b.x + 0.02, y + 0.03, 10 + f * 6, 0, { tone: "force", label: `${f} N` });
    });
    if (part === 0) askLabel(P, 1.25, 0.06, "a(F) ?", 0, 0);
    if (part === 1) askLabel(P, 1.25, 0.06, "F₀ ?", 0, 0);
    if (part === 2) askLabel(P, 1.25, 0.06, "mB = ?", 0, 0);
    if (part === 3) askLabel(P, 0.15, 0.03, "T = ?", 0, -20);
    if (part === 4) askLabel(P, 1.25, 0.06, "a(F) ?", 0, 0);
  },
});
