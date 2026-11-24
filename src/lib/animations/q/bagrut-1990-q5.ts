import { radialSpec } from "./_space";

/** 1990 q5: a body falls from rest from height h onto a star of radius R with no air: v² = 2gRh/(R + h). Drawn h = R (units: R = 1, g = 1). */
export const spec = radialSpec({
  id: "bagrut-1990-q5",
  R: 1,
  gm: 1,
  r0: 2,
  v0: 0,
  r1: 1,
  answers: { vEnd: [Math.sqrt((2 * 1 * 1 * 1) / 2), 1e-6] },
  parts: [
    { caption: "הגוף נופל ממנוחה מגובה h. באיזו מהירות הוא פוגע בפני הכוכב, לפי R, h ו-g?", ask: "v = ?", at: "planet" },
    { caption: "הראו שכאשר h קטן מאוד לעומת R, המהירות בערך √(2gh).", ask: "h ≪ R ?" },
    { caption: "איזו תנועה יש לגוף כש-h גדול מאוד לעומת R?", ask: "?" },
    { caption: "ואיזו תנועה כש-h קטן מאוד לעומת R?", ask: "?" },
  ],
});
