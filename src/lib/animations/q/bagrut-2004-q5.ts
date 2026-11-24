import { orbitSpec } from "./_space";

/** 2004 q5: the Earth around the Sun (GM of the Sun from the graph's slope, 4π²/slope). */
export const spec = orbitSpec({
  id: "bagrut-2004-q5",
  R: 7e9 * 3,
  r: 1.5e11,
  gm: (4 * Math.PI ** 2) / 3.44e-19,
  laps: 1,
  extra: (P, c) => { const s = 0.88; P.circle(c.x * s, c.z * s, 4, { fill: "runner" }); P.mono(c.x * s, c.z * s, "L", { tone: "runner", size: 10, dxPx: -10 }); },
  parts: [
    { caption: "פתחו את החוק השלישי של קפלר, למסלולים מעגליים, מחוק הכבידה.", ask: "T² ∝ r³ ?", at: "center" },
    { caption: "מה השיפוע של הגרף של T² כפונקציה של r³?", ask: "slope = ?", at: "center" },
    { caption: "בעזרת השיפוע: מה מסת השמש?", ask: "M = ?", at: "center" },
    { caption: "לוויין תמיד על הקו בין השמש לכדור הארץ. איזו משוואה מתארת את התנועה שלו?", ask: "?" },
    { caption: "ללוויין ולכדור הארץ אותו זמן מחזור ורדיוסים שונים. למה זה לא סותר את חוק קפלר?", ask: "?" },
  ],
});
