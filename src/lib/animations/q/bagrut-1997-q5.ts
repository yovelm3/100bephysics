import { orbitSpec } from "./_space";

/** 1997 q5: from H = 10⁷ m the planet looks 60° wide, so R = 10⁷ m; then a circular orbit at H (GM from the answer). */
export const spec = orbitSpec({
  id: "bagrut-1997-q5",
  R: 1e7,
  r: 2e7,
  gm: 6.67e-11 * 6.710661268746142e25,
  laps: 1,
  extra: (P, c, _t, part) => { if (part === 0) { P.line(c.x, c.z, 0, 1e7, { tone: "idle", w: 1, dash: "4 4" }); P.line(c.x, c.z, 0, -1e7, { tone: "idle", w: 1, dash: "4 4" }); } },
  parts: [
    { caption: "מגובה H = 10⁷ m הכוכב נראה בזווית של 60°. מה הרדיוס של הכוכב?", ask: "R = ?", at: "planet", until: 0.02 },
    { caption: "החללית במסלול מעגלי בגובה H. לפי זמן המחזור: מה מסת הכוכב?", ask: "M = ?", at: "planet" },
    { caption: "מה תאוצת הנפילה החופשית על פני הכוכב?", ask: "g = ?", at: "planet" },
    { caption: "האסטרונאוט משחרר כדור בתוך החללית. איך ינוע הכדור ביחס לחללית?", ask: "?" },
  ],
});
