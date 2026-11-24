import { orbitSpec } from "./_space";

/** 1995 q5: the Earth's mass from g and R, and from the Moon's orbit (60 R, 27.3 days). */
export const spec = orbitSpec({
  id: "bagrut-1995-q5",
  R: 6.4e6,
  r: 60 * 6.4e6,
  gm: 9.8 * 6.4e6 ** 2,
  laps: 1,
  parts: [
    { caption: "כתבו את המסה של כוכב לכת לפי הרדיוס שלו ותאוצת הנפילה החופשית על פניו.", ask: "M = ?", at: "planet" },
    { caption: "מה מסת כדור הארץ, לפי הביטוי הזה?", ask: "M = ?", at: "planet" },
    { caption: "כתבו את המסה של כוכב לכת לפי זמן המחזור ורדיוס המסלול של לוויין.", ask: "M(T, r) = ?" },
    { caption: "מה מסת כדור הארץ, מהנתונים של הירח?", ask: "M = ?" },
    { caption: "הוכיחו שהאנרגיה הקינטית של לוויין במסלול מעגלי היא GMm/2r.", ask: "Ek = ?" },
  ],
});
