import { orbitSpec } from "./_space";

/** 2011 q5: Amos 1, always above the same point A (period one day); M = 5.98·10²⁴ kg, R = 6.37·10⁶ m. */
export const spec = orbitSpec({
  id: "bagrut-2011-q5",
  R: 6.37e6,
  r: Math.cbrt((6.67e-11 * 5.98e24 * 86400 ** 2) / (4 * Math.PI ** 2)),
  gm: 6.67e-11 * 5.98e24,
  laps: 1, showA: true,
  extra: (P, _c, t) => { const a = (2 * Math.PI * t) / 86400; P.line(0, 0, 6.37e6 * Math.cos(a), 6.37e6 * Math.sin(a), { tone: "line", w: 2 }); P.mono(6.37e6 * Math.cos(a), 6.37e6 * Math.sin(a), "A", { tone: "data", size: 11, dxPx: -10 }); },
  parts: [
    { caption: "מה זמן המחזור של עמוס 1, בשעות?", ask: "T = ?" },
    { caption: "באיזה גובה מעל פני כדור הארץ נמצא המסלול?", ask: "h = ?", at: "orbit" },
    { caption: "מה גודל התאוצה של עמוס 1 במסלול?", ask: "a = ?" },
    { caption: "לוויין אחר מקיף ב-12 שעות. באיזה גובה הוא נמצא?", ask: "h = ?", at: "orbit" },
    { caption: "איזה היגד לא נכון?", ask: "?" },
  ],
});
