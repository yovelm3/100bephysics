import { orbitSpec } from "./_space";

/** 1988 q5: the energy to put a spacecraft in orbit, and a station that stays above the same point (period one day). */
export const spec = orbitSpec({
  id: "bagrut-1988-q5",
  R: 6.4e6,
  r: Math.cbrt((10 * 6.4e6 ** 2 * 86400 ** 2) / (4 * Math.PI ** 2)),
  gm: 10 * 6.4e6 ** 2,
  laps: 1,
  extra: (P, _c, t) => { const a = (2 * Math.PI * t) / 86400; P.line(0, 0, 6.4e6 * Math.cos(a), 6.4e6 * Math.sin(a), { tone: "line", w: 2 }); },
  parts: [
    { caption: "מה האנרגיה שצריך כדי להעלות את החללית מכן השיגור למסלול מעגלי ברדיוס r?", ask: "E = ?" },
    { caption: "תחנת חלל נשארת תמיד מעל אותה נקודה בקו המשווה. באיזה גובה היא נמצאת?", ask: "h = ?", at: "orbit" },
  ],
});
