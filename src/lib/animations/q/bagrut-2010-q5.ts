import { orbitSpec } from "./_space";

/** 2010 q5: a spacecraft around the Sun on the Earth's orbit (1.5·10¹¹ m; Sun's mass 1.99·10³⁰ kg). */
export const spec = orbitSpec({
  id: "bagrut-2010-q5",
  R: 7e9 * 3,
  r: 1.5e11,
  // the period is the Earth's year (365 days), as in the answer
  gm: (4 * Math.PI ** 2 * 1.5e11 ** 3) / (365 * 86400) ** 2,
  laps: 1,
  answers: { v: [29885.7748629166, 0.5] },
  parts: [
    { caption: "למה המהירות של החללית שווה למהירות של כדור הארץ סביב השמש?", ask: "v = vE ?" },
    { caption: "מה המהירות של החללית?", ask: "v = ?" },
    { caption: "אריס נמצא במרחק 1.01·10¹⁰ km מהשמש. מה זמן ההקפה שלו?", ask: "T = ?", at: "center" },
    { caption: "מה האנרגיה המזערית שצריך לתת לחללית של 800 ק\"ג כדי שתשתחרר מהשמש?", ask: "E = ?" },
    { caption: "לשגר אל אריס: האם האנרגיה המזערית גדולה, קטנה או שווה ל-E0?", ask: "E ? E0" },
  ],
});
