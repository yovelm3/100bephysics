import { orbitSpec } from "./_space";

/** 2006 q5: a satellite around the Moon that turns with it (period 27.3 days): 88 400 km if only the Moon pulls (GM of the Moon from g = 1.62 m/s², R = 1740 km). */
export const spec = orbitSpec({
  id: "bagrut-2006-q5",
  R: 1.74e6,
  r: 8.84e7,
  gm: 1.6192528735632183 * 1.74e6 ** 2,
  laps: 1,
  parts: [
    { caption: "מה רדיוס המסלול של לוויין כזה, אם רק הירח משפיע?", ask: "r = ?", at: "orbit" },
    { caption: "בגלל כדור הארץ, הרדיוס הגדול ביותר קטן יותר. מה זמן המחזור במסלול הזה?", ask: "T = ?" },
    { caption: "מה תאוצת הנפילה החופשית על פני הירח?", ask: "g = ?", at: "planet" },
    { caption: "כתבו תרומה אחת לידע על מערכת השמש של קופרניקוס, גלילאו או טיכו ברהה.", ask: "?", at: "center" },
  ],
});
