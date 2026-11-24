import { orbitSpec } from "./_space";

/** 1991 q5: two satellites around the same star, at v and 2v: the second's orbit is 4 times smaller and its period 8 times shorter (drawn in orange). */
const R = 1, gm = 1, r1 = 8;
const T2 = 2 * Math.PI * Math.sqrt((r1 / 4) ** 3 / gm);
export const spec = orbitSpec({
  id: "bagrut-1991-q5",
  R,
  r: r1,
  gm,
  laps: 1,
  parts: [
    { caption: "לוויין אחד במהירות v, ולוויין שני במהירות 2v. לאיזה מהם רדיוס מסלול גדול יותר, ופי כמה?", ask: "r₁ / r₂ = ?", at: "orbit" },
    { caption: "לאיזה לוויין זמן מחזור גדול יותר, ופי כמה?", ask: "T₁ / T₂ = ?" },
    { caption: "מטאוריט מכפיל את המהירות של הלוויין הראשון. האם הוא ישתחרר מהכוכב?", ask: "?", until: 0.1 },
  ],
  extra: (P, _c, t) => {
    const a = (2 * Math.PI * t) / T2, r2 = r1 / 4;
    P.ring(0, 0, r2, { tone: "idle", w: 1, dash: "5 5" });
    P.circle(r2 * Math.cos(a), r2 * Math.sin(a), 5, { fill: "runner" });
  },
});
