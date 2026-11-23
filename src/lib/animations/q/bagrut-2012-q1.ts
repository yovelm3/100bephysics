import type { Painter } from "../engine";
import { askLabel, graphMotion } from "../kits";

/**
 * 2012 q1: free fall on a planet, positions every 0.08 s (y down). The trend line of the measured speeds:
 * v = 1.0 + 20.17 t, so the body is drawn with this motion; the table is the question's data.
 */
const T = [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48];
const Y = [0.016, 0.15, 0.43, 0.81, 1.4, 2.0, 2.84];
const pts = T.slice(1, 6).map((t, k) => [t, (Y[k + 2] - Y[k]) / 0.16] as const);
const tm = pts.reduce((a, p) => a + p[0], 0) / 5, vm = pts.reduce((a, p) => a + p[1], 0) / 5;
const slope = pts.reduce((a, p) => a + (p[0] - tm) * (p[1] - vm), 0) / pts.reduce((a, p) => a + (p[0] - tm) ** 2, 0);
const b0 = vm - slope * tm;
const TOP = 3; // height of the release point above the drawn floor; height = TOP − y

function table(P: Painter, upto: number) {
  P.textPx(70, 60, "t (s)", { tone: "text", size: 12, anchor: "middle" });
  P.textPx(170, 60, "y (m)", { tone: "text", size: 12, anchor: "middle" });
  T.forEach((t, i) => {
    const tone = t <= upto + 1e-9 ? "data" : "idle";
    P.textPx(70, 84 + i * 24, String(t), { tone, size: 12, anchor: "middle" });
    P.textPx(170, 84 + i * 24, Y[i].toFixed(3), { tone, size: 12, anchor: "middle" });
  });
}

export const spec = graphMotion({
  id: "bagrut-2012-q1",
  vertical: true,
  panel: "none",
  shape: "ball",
  strobe: { every: 0.08 },
  x0: TOP - Y[0],
  v: [[0, -b0], [0.48, -(b0 + slope * 0.48)]],
  names: ["start", "end"],
  range: [0, 3.2],
  marks: [[TOP, "y = 0"]],
  graph: { vMin: -12, vMax: 0 },
  answers: { "a@0": [-20.17, 0.05] },
  parts: [
    { to: () => 0.24, pace: 12, caption: "הגוף נופל, והמקום שלו נרשם כל 0.08 s. מה המהירות שלו בקירוב ברגע t = 0.24 s?", ask: (P, m, t) => { if (t >= 0.24 - 1e-9) askLabel(P, 0, m.state(0.24).b.x, "v = ?", 20, 0); } },
    { to: () => 0.48, pace: 12, caption: "באותה דרך: מה המהירות ברגעים 0.08, 0.16, 0.32 ו-0.4 שניות?", ask: (P, m, t) => { for (const tq of [0.08, 0.16, 0.32, 0.4]) if (t >= tq - 1e-9) askLabel(P, 0, m.state(tq).b.x, "v = ?", 20, 4); } },
    { to: () => 0.48, pace: 12, caption: "מהמהירויות שחישבתם: איך נראות הנקודות של המהירות כפונקציה של הזמן?", ask: (P) => askLabel(P, 0, 0.3, "v(t) ?", 20, 0) },
    { to: () => 0.48, pace: 12, caption: "המהירות גדלה בקצב קבוע. מה השיפוע של קו המגמה, ומה הוא מייצג?", ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "a = ?", 20, 0) },
    { to: () => 0.48, pace: 12, caption: "הרדיוס של כוכב הלכת שווה לרדיוס של כדור הארץ. מה היחס בין המסות שלהם?", ask: (P) => askLabel(P, 0, 0.3, "M / M⊕ = ?", 20, 0) },
  ],
  extra: (P, _m, t) => table(P, t),
});
