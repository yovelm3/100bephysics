import { orbitSpec } from "./_space";

/**
 * 2014 q5: Mars's moons: Phobos (T = 0.3189 days, r = 9.377·10⁶ m) is the one drawn; Deimos (T = 1.262 days) is drawn
 * in orange on its own orbit (radius from Kepler's third law). Mars's mass follows from Phobos's orbit.
 */
const rP = 9.377e6, TP = 0.3189 * 86400, TD = 1.262 * 86400;
const gm = (4 * Math.PI ** 2 * rP ** 3) / TP ** 2;
const rD = rP * Math.cbrt((TD / TP) ** 2);
export const spec = orbitSpec({
  id: "bagrut-2014-q5",
  R: 3.4e6,
  r: rP,
  gm,
  span: rD,
  laps: 1,
  parts: [
    { caption: "מה רדיוס המסלול של דימוס?", ask: "rD = ?", at: "orbit" },
    { caption: "האם אפשר לחשב את רדיוס המסלול של הירח שלנו רק מזמן המחזור שלו, כמו את של דימוס?", ask: "?", at: "center" },
    { caption: "מה מסת מאדים, לפי נתוני השאלה?", ask: "M = ?", at: "planet" },
    { caption: "חללית ריחפה 20 m מעל פני מאדים, ואז נפגעה. מה המהירות שלה אחרי ההתנגשות?", ask: "v = ?", at: "planet", until: 0.05 },
    { caption: "המנועים כבויים. כמה זמן אחרי ההתנגשות היא פוגעת בקרקע?", ask: "t = ?", at: "planet", until: 0.05 },
  ],
  extra: (P, _c, t) => { const a = (2 * Math.PI * t) / TD; P.ring(0, 0, rD, { tone: "idle", w: 1, dash: "5 5" }); P.circle(rD * Math.cos(a), rD * Math.sin(a), 5, { fill: "runner" }); },
});
