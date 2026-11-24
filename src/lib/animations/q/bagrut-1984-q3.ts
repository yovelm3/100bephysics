import { orbitSpec } from "./_space";

/** 1984 q3: two uniform stars A and B; a satellite close to each one's surface. Star A is drawn. */
export const spec = orbitSpec({
  id: "bagrut-1984-q3",
  R: 1e7,
  r: 1.05e7,
  gm: 4e14,
  laps: 1,
  parts: [
    { caption: "מה היחס בין תאוצות הנפילה החופשית על פני שני הכוכבים, לפי הרדיוסים והצפיפויות?", ask: "gA / gB = ?", at: "planet" },
    { caption: "לוויין קרוב לפני כל כוכב. מה היחס בין זמני המחזור?", ask: "TA / TB = ?" },
    { caption: "מה היחס בין האנרגיות הכוללות של שני הלוויינים, אם המסות שלהם שוות?", ask: "EA / EB = ?" },
    { caption: "מה היחס בין מהירויות השיגור המזעריות אל מחוץ לתחום המשיכה?", ask: "vA / vB = ?", at: "planet" },
  ],
});
