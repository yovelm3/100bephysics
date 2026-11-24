import { radialSpec } from "./_space";

/**
 * 1989 q5: the Earth and the Moon only (d = 60R, M2 = M1/81): the neutral point O at 54R; a spacecraft launched from A
 * toward the Moon with the least energy passes O with no speed. Both pulls in both builds; R = 1, GM1 = 1.
 */
const gm = 1, gm2 = 1 / 81, d = 60, rO = 54;
const pot = (r: number) => -gm / r - gm2 / (d - r);
const v0 = Math.sqrt(2 * (pot(rO) - pot(1)));
export const spec = radialSpec({
  id: "bagrut-1989-q5",
  R: 1,
  gm,
  gm2,
  d,
  r0: 1,
  v0,
  r1: rO * 0.9,
  parts: [
    { caption: "על הקו בין המרכזים יש נקודה O שבה גוף נשאר במנוחה. מה המרחק שלה ממרכז כדור הארץ?", ask: "O = ?", until: 0.3 },
    { caption: "מה האנרגיה המזערית שצריך לתת לחללית ב-A כדי שתגיע לירח?", ask: "E = ?", at: "planet" },
    { caption: "איזה חלק באנרגיה אפשר להזניח, אם מספיק דיוק של 99.9%?", ask: "?" },
  ],
  extra: (P) => { P.line(-1.5, rO - 1, 1.5, rO - 1, { tone: "data", w: 1, dash: "4 4" }); P.mono(1.6, rO - 1, "O", { tone: "data", size: 12, anchor: "start" }); },
});
