import { orbitSpec } from "./_space";

/** 2015 q5: the space station at 400 km above the equator (M = 5.98·10²⁴ kg, R = 6.37·10⁶ m). */
export const spec = orbitSpec({
  id: "bagrut-2015-q5",
  R: 6.37e6,
  r: 6.77e6,
  gm: 6.67e-11 * 5.98e24,
  laps: 1, showA: true,
  answers: { a: [8.702613188342873, 1e-6] },
  parts: [
    { caption: "מה התאוצה של התחנה במסלול?", ask: "a = ?" },
    { caption: "איזה היגד נכון על המהירות ועל הכוח?", ask: "?" },
    { caption: "בגובה התחנה הכובד כמעט כמו על הקרקע. למה האסטרונאוטים מרחפים?", ask: "?" },
    { caption: "כמה פעמים ביממה התחנה עוברת מעל אותה נקודה בקו המשווה?", ask: "N = ?", at: "planet" },
    { caption: "האם האנרגיה המכנית של התחנה נשמרת במסלול?", ask: "E = const ?" },
  ],
});
