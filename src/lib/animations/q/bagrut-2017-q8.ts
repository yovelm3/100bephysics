import { radialSpec } from "./_space";

/**
 * 2017 q8: the Earth and the Moon only (d = 60R, M2 = M1/81). On the line between them, at 54R from the Earth's center,
 * the pulls cancel (point O). A spacecraft launched from A with the least energy reaches O with no speed.
 * Both pulls in both builds. Units: R = 1, GM1 = 1. The story ends just before O.
 */
const gm = 1, gm2 = 1 / 81, d = 60, rO = 54;
const pot = (r: number) => -gm / r - gm2 / (d - r);
const v0 = Math.sqrt(2 * (pot(rO) - pot(1)));
export const spec = radialSpec({
  id: "bagrut-2017-q8",
  R: 1,
  gm,
  gm2,
  d,
  r0: 1,
  v0,
  r1: rO * 0.9,
  parts: [
    { caption: "על הקו בין כדור הארץ לירח יש נקודה O שבה הכוחות מתקזזים. מה המרחק שלה ממרכז כדור הארץ?", ask: "O = ?", until: 0.3 },
    { caption: "מה האנרגיה המזערית שצריך לתת לחללית ב-A כדי שתגיע ל-O?", ask: "E = ?", at: "planet" },
    { caption: "ז'ול ורן תיאר מסע לירח. האם התיאור שלו נכון?", ask: "?" },
  ],
  extra: (P) => { P.line(-1.5, rO - 1, 1.5, rO - 1, { tone: "data", w: 1, dash: "4 4" }); P.mono(1.6, rO - 1, "O", { tone: "data", size: 12, anchor: "start" }); },
});
