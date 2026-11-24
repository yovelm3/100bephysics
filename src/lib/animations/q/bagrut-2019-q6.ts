import { orbitSpec } from "./_space";

/** 2019 q6: Apollo 11's parking orbit, 190 km above the Earth (R = 6.37·10⁶ m, M = 5.98·10²⁴ kg). Parts ד–ה ask about the trip to the Moon along the line between the centers. */
const R = 6.37e6, gm = 6.67e-11 * 5.98e24;
export const spec = orbitSpec({
  id: "bagrut-2019-q6",
  R,
  r: R + 1.9e5,
  gm,
  laps: 1,
  showA: true,
  answers: { v: [7797.61142289349, 0.01] },
  parts: [
    { caption: "מה גודל המהירות של החללית במסלול הביניים?", ask: "v = ?" },
    { caption: "תלמידה טוענת שהחללית בשיווי משקל, כי גודל המהירות קבוע. האם היא צודקת?", ask: "ΣF = 0 ?" },
    { caption: "אילו המסה של החללית הייתה גדולה יותר: האם גודל המהירות היה משתנה?", ask: "v(m) ?" },
    { caption: "ואם המסה הייתה גדולה יותר: האם האנרגיה המכנית הכוללת הייתה גדלה, קטנה או לא משתנה?", ask: "E(m) ?" },
    { caption: "בדרך לירח, בנקודה D על הקו בין המרכזים: מה הכוח השקול על החללית?", ask: "ΣF = ?", at: "orbit" },
    { caption: "איזה גרף מתאר את הכוח השקול כפונקציה של המרחק ממרכז כדור הארץ?", ask: "ΣF(r) ?", at: "orbit" },
  ],
});
