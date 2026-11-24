import { orbitSpec } from "./_space";

/** 1992 q5: satellites around the Earth; the one drawn moves above the equator with a 12-hour period (the line marks a point on the turning Earth). */
const R = 6.4e6, gm = 10 * R * R, T = 12 * 3600;
export const spec = orbitSpec({
  id: "bagrut-1992-q5",
  R,
  r: Math.cbrt((gm * T * T) / (4 * Math.PI ** 2)),
  gm,
  laps: 2,
  parts: [
    { caption: "לוויין עובר ממסלול מעגלי גבוה לנמוך. האם האנרגיה הקינטית שלו קטנה, גדלה או לא משתנה?", ask: "Ek ?" },
    { caption: "האם האנרגיה הכוללת שלו קטנה, גדלה או לא משתנה?", ask: "E ?" },
    { caption: "על הקרקע המאזניים מראים 10 N. מה הם מראים בזמן השיגור, בתאוצה של 4g?", ask: "F = ?", at: "planet", until: 0.05 },
    { caption: "מה הם מראים כשהלוויין במסלול, אחרי שהמנועים כבו?", ask: "F = ?" },
    { caption: "זמן המחזור 12 שעות. כל כמה זמן הוא עובר מעל אותה נקודה בקו המשווה?", ask: "Δt = ?" },
  ],
  extra: (P, _c, t) => { const a = (2 * Math.PI * t) / 86400; P.line(0, 0, R * Math.cos(a), R * Math.sin(a), { tone: "line", w: 2 }); },
});
