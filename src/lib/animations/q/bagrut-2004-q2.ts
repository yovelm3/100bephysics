import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2004 q2: fixed pulley O1 (on string S1), moving pulley O2 holding the 100 kg weight (string S2). The man (80 kg) pulls
 * the end of S3, which goes over O1, under O2 and up to the ceiling, so two parts of S3 hold O2 (2T up on the weight).
 * Story: he pulls with 100 N, then 500 N, then 800 N (1 s each); with 800 N the weight rises (2·800 − 1000 = 100·a).
 */
const g = 10, M = 100, steps = [100, 500, 800];
const aOf = (T: number) => Math.max(0, (2 * T - M * g) / M);
export const spec = storySpec({
  id: "bagrut-2004-q2",
  view: { x0: -3.4, x1: 3.4, y0: -0.3, y1: 3.1 },
  scale: 3,
  story: {
    init: { w: body(0.6, 0, 0, 0) },
    phases: steps.map((T, i) => ({
      end: `F${T}`,
      acc: { w: [0, aOf(T)] as [number, number] },
      dur: () => (i === 2 ? 0.3 : 1),
      // build 2: the weight with the ground's normal force N = max(0, Mg − 2T)
      force: () => { const N = Math.max(0, M * g - 2 * T); return { w: [0, (2 * T + N - M * g) / M] as [number, number] }; },
      until: (_s, t) => t >= (i === 2 ? 2.3 : i + 1) - 1e-12,
    })),
    record: { a800: ["F800", (s) => s.w.vy / 0.3] },
  },
  order: ["F100", "F500", "F800"],
  answers: { a800: [6, 1e-9] },
  parts: [
    { to: () => 1, pace: 1, caption: "האדם מושך את קצה S3 בכוח של 100 N. מה הכוח שהאדם מפעיל על הקרקע, המתיחות ב-S1, והכוח של המשקולת על הקרקע?" },
    { to: () => 2, pace: 1, caption: "מה הכוח הקטן ביותר שבו צריך למשוך, כדי שהמשקולת לא תלחץ על הקרקע?" },
    { to: () => 2.3, pace: 1, caption: "האדם מושך בכוח הגדול ביותר שבו הוא עוד לא מתרומם. מה הכוח, והאם המשקולת מאיצה?" },
  ],
  draw: (P, m, t, part) => {
    const s = m.state(t).w;
    const T = t < 1 ? 100 : t < 2 ? 500 : 800;
    P.ground(0, -3, 3);
    P.line(-1.4, 2.9, 1.6, 2.9, { tone: "line", w: 3 });
    // S1 and the fixed pulley O1
    P.line(-0.3, 2.9, -0.3, 2.65, { tone: "line", w: 1.4 }); P.pulley(-0.3, 2.5, 14);
    P.mono(-0.15, 2.78, "S₁", { tone: "data", size: 10, anchor: "start" }); P.mono(-0.3, 2.5, "O₁", { tone: "data", size: 10, dyPx: 30 });
    // O2 above the weight; S3: hand → over O1 → down under O2 → up to the ceiling
    const o2 = s.y + 1.3;
    const hand = 1.0 - 2 * s.y;
    P.line(-0.48, 2.5, -0.48, hand, { tone: "line", w: 1.4 });
    P.line(-0.12, 2.5, -0.12, o2, { tone: "line", w: 1.4 }); P.mono(-0.2, 2.0, "S₃", { tone: "data", size: 10, anchor: "end" });
    P.pulley(0.3, o2, 14); P.mono(0.3, o2, "O₂", { tone: "data", size: 10, dyPx: 30 });
    P.line(0.48, o2, 0.48, 2.9, { tone: "line", w: 1.4 });
    P.line(0.3, o2 - 0.15, 0.3, s.y + 0.4, { tone: "line", w: 1.4 }); P.mono(0.36, s.y + 0.8, "S₂", { tone: "data", size: 10, anchor: "start" });
    P.block(0.3, s.y, { wPx: 60, hPx: 34, label: "100 kg" });
    P.person(-0.48, 0, t, { tone: "runner", facing: 1 });
    P.arrowPx(-0.62, hand, 0, 34, { tone: "force", label: `${T} N` });
    P.mono(-0.9, 0, "80 kg", { tone: "data", size: 11, dyPx: 14 });
    if (part === 0) { askLabel(P, -0.48, 0, "N = ?", -70, -24); askLabel(P, -0.3, 2.8, "T₁ = ?", -40, 0); askLabel(P, 0.3, 0, "N(M) = ?", 50, -10); }
    if (part === 1 && t >= 1) askLabel(P, -0.48, hand, "F min = ?", -60, 10);
    if (part === 2 && t >= 2) { askLabel(P, -0.48, hand, "F = ?", -60, 10); askLabel(P, 0.3, s.y, "a = ?", 50, -10); }
  },
});
