import { orbitSpec } from "./_space";

/** 1999 q5: a satellite around Jupiter at 10⁵ km (GM of Jupiter 1.267·10¹⁷ m³/s²). */
export const spec = orbitSpec({
  id: "bagrut-1999-q5",
  R: 7.15e7,
  r: 1e8,
  gm: 1.267e17,
  laps: 1,
  parts: [
    { caption: "הראו שארבעת הירחים בטבלה מקיימים את החוק השלישי של קפלר.", ask: "T²/r³ ?", at: "center" },
    { caption: "לוויין במסלול מעגלי ברדיוס 10⁵ km סביב צדק. מה זמן המחזור שלו, ביממות?", ask: "T = ?" },
    { caption: "כתבו את מסת צדק לפי זמן המחזור ורדיוס המסלול של אחד הירחים.", ask: "M = ?", at: "center" },
    { caption: "סביב כוכב לכת אחר, באותו רדיוס: האם זמן המחזור שווה?", ask: "T ?" },
  ],
});
