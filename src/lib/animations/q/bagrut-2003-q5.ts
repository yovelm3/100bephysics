import { orbitSpec } from "./_space";

/** 2003 q5: a communications satellite always above the same point P: period one day, radius from Kepler's third law with the Moon's data. */
export const spec = orbitSpec({
  id: "bagrut-2003-q5",
  R: 6.4e6,
  r: 3.84e8 * Math.cbrt((1 / 27.3) ** 2),
  gm: (4 * Math.PI ** 2 * 3.84e8 ** 3) / (27.3 * 86400) ** 2,
  laps: 1,
  extra: (P, c) => { const a = Math.atan2(c.z, c.x); P.line(0, 0, 6.4e6 * Math.cos(a), 6.4e6 * Math.sin(a), { tone: "line", w: 2 }); P.mono(6.4e6 * Math.cos(a), 6.4e6 * Math.sin(a), "P", { tone: "data", size: 11, dxPx: -10 }); },
  parts: [
    { caption: "הלוויין תמיד מעל אותה נקודה P. מה זמן המחזור שלו?", ask: "T = ?" },
    { caption: "לפי החוק השלישי של קפלר והנתונים של הירח: מה רדיוס המסלול?", ask: "r = ?", at: "orbit" },
    { caption: "מה המהירות של הלוויין?", ask: "v = ?" },
    { caption: "למה המסלול חייב להיות מעגלי?", ask: "?" },
    { caption: "למה הנקודה P חייבת להיות על קו המשווה?", ask: "?", at: "planet" },
  ],
});
