import { radialSpec } from "./_space";

/** 1987 q5: a rocket from a planet's surface (no air) at v0; at 3R above the surface its speed is v0/4, so v0² = 1.6GM/R and it rises to 4R. Units: R = 1, GM = 1. */
export const spec = radialSpec({
  id: "bagrut-1987-q5",
  R: 1,
  gm: 1,
  r0: 1,
  v0: Math.sqrt(1.6),
  r1: 4.995,
  points: { at3R: 4 },
  answers: { "v@at3R": [Math.sqrt(1.6) / 4, 1e-6] },
  parts: [
    { caption: "במרחק 3R מפני הכוכב, המהירות של הטיל רבע ממהירות השיגור. מה v0?", ask: "v0 = ?", at: "planet", until: 0.6 },
    { caption: "באיזה כיוון לשגר כדי שהטיל יגיע לגובה מרבי? מה הגובה הזה?", ask: "h max = ?" },
    { caption: "מה המהירות המזערית שצריך כדי שהטיל ישתחרר לגמרי מהכוכב?", ask: "v min = ?", at: "planet", until: 0.3 },
  ],
  extra: (P) => { P.line(-0.2, 3, 0.2, 3, { tone: "data", w: 1 }); P.mono(0.22, 3, "3R", { tone: "data", size: 11, anchor: "start" }); },
});
