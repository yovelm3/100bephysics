import { askLabel, graphMotion } from "../kits";

/** 2019 q1: a ball thrown up at 10 m/s from a 40 m roof; it lands at 4 s. The question gives y(t) with points A (0 s), B (1 s), C (3 s), D (4 s). */
const yAt = (t: number) => 40 + 10 * t - 5 * t * t;
const pt = (P: Parameters<NonNullable<Parameters<typeof graphMotion>[0]["extra"]>>[0], t: number, lab: string) => {
  P.circle(0, yAt(t), 4, { fill: "data" });
  P.mono(0, yAt(t), lab, { tone: "data", size: 12, dxPx: -16, dyPx: 4 });
};
export const spec = graphMotion({
  id: "bagrut-2019-q1",
  vertical: true,
  shape: "ball",
  panel: "x",
  xGraph: { xMin: 0, xMax: 48, label: "y (m)", tTicks: [1, 2, 3, 4], xTicks: [[10, "10"], [20, "20"], [30, "30"], [40, "40"]] },
  x0: 40,
  v: [[0, 10], [4, -30]],
  names: ["A", "D"],
  range: [0, 48],
  graph: { vMin: -30, vMax: 10 },
  answers: { turn0: [1, 1e-9], "x@D": [0, 1e-9], xmax: [45, 1e-9] },
  parts: [
    { to: () => 0.4, pace: 1.5, caption: "הכדור נזרק כלפי מעלה מגג הבניין. מה גודל המהירות ההתחלתית שלו?", ask: (P) => askLabel(P, 0, 40, "v₀ = ?", 24, 0) },
    { to: () => 3, pace: 0.9, caption: "האם גודל המהירות בנקודה C קטן מגודל המהירות בנקודה A, גדול ממנו או שווה לו?", ask: (P, _m, t) => { askLabel(P, 0, 40, "|v| ?", 24, 0); if (t >= 3 - 1e-9) askLabel(P, 0, yAt(3), "|v| ?", 24, 0); } },
    { to: () => 1, pace: 0.9, caption: "האם התאוצה בנקודה B זהה לתאוצה בנקודה A, בגודל ובכיוון?", ask: (P, _m, t) => { askLabel(P, 0, 40, "a ?", 24, 0); if (t >= 1 - 1e-9) askLabel(P, 0, 45, "a ?", 24, 0); } },
    { to: (m) => m.events.D, pace: 0.9, caption: "מה המהירות הממוצעת של הכדור, בגודל ובכיוון, מהזריקה ועד הפגיעה בקרקע?", ask: (P, m, t) => { if (t >= m.events.D - 1e-9) askLabel(P, 0, 20, "v̄ = ?", 24, 0); } },
    { to: (m) => m.events.D, pace: 0.9, caption: "איך נראה גרף המהירות של הכדור כפונקציה של הזמן?", ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "v(t) ?", 24, 0) },
    { to: (m) => m.events.D, pace: 0.9, caption: "כשהכדור עובר בנקודה C פועל עליו לרגע כוח אופקי. האם הגרף של y(t) משתנה?", ask: (P, _m, t) => { if (t >= 3 - 1e-9 && t < 3.25) P.arrowPx(0, yAt(3), 46, 0, { tone: "force", label: "F" }); if (t >= 3) askLabel(P, 0, yAt(3), "y(t) ?", 24, 30); } },
  ],
  extra: (P, _m, t) => { pt(P, 0, "A"); if (t >= 1 - 1e-9) pt(P, 1, "B"); if (t >= 3 - 1e-9) pt(P, 3, "C"); if (t >= 4 - 1e-9) pt(P, 4, "D"); },
});
