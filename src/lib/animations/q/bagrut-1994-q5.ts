import { radialSpec } from "./_space";

/** 1994 q5: a planet with R = 10⁷ m and g = 10 m/s² on its surface; a body let go at A, R above the surface, falls in (10⁴ m/s at the surface). */
const R = 1e7, gm = 10 * R * R;
export const spec = radialSpec({
  id: "bagrut-1994-q5",
  R,
  gm,
  r0: 2 * R,
  v0: 0,
  r1: R,
  answers: { vEnd: [1e4, 1] },
  parts: [
    { caption: "מה תאוצת הנפילה החופשית בנקודה A, בגובה R מעל פני הכוכב?", ask: "gA = ?", until: 0.02 },
    { caption: "איך משתנה תאוצת הנפילה בדרך מ-A עד פני הכוכב?", ask: "g(r) ?" },
    { caption: "העריכו את זמן הנפילה: מה הגבול התחתון?", ask: "t > ?", at: "planet" },
    { caption: "ומה הגבול העליון?", ask: "t < ?", at: "planet" },
    { caption: "באיזו מהירות הגוף פוגע בפני הכוכב?", ask: "v = ?", at: "planet" },
  ],
  extra: (P) => P.mono(0, R, "A", { tone: "data", size: 12, dxPx: -14 }),
});
