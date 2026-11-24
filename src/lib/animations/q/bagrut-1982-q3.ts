import { orbitSpec } from "./_space";

/** 1982 q3: a 1000 kg satellite in a circular orbit R1 = 4R (T1 = 40 212 s); raising it to R2 (T2 = 8T1, so R2 = 4R1) takes 6·10⁹ J. */
const R = 6.4e6, gm = 10 * R * R;
export const spec = orbitSpec({
  id: "bagrut-1982-q3",
  R,
  r: 4 * R,
  gm,
  span: 16 * R,
  laps: 1,
  parts: [
    { caption: "T2/T1 = 8, ובשביל המעבר צריך 6·10⁹ J. מה הרדיוס R1 של המסלול הראשון?", ask: "R1 = ?", at: "orbit" },
    { caption: "מה זמן המחזור T1 במסלול הראשון?", ask: "T1 = ?" },
    { caption: "כמה אנרגיה היה צריך כדי להעלות את הלוויין מכן השיגור למסלול הראשון?", ask: "E = ?", at: "planet" },
  ],
  extra: (P) => P.ring(0, 0, 16 * R, { tone: "soft", w: 1, dash: "2 5" }),
});
