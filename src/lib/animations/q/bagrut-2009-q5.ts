import { orbitSpec } from "./_space";

/** 2009 q5: from H = 10⁷ m the planet looks 60° wide (R = 10⁷ m); then a circular orbit at H with a period of 150 minutes. */
export const spec = orbitSpec({
  id: "bagrut-2009-q5",
  R: 1e7,
  r: 2e7,
  gm: (4 * Math.PI ** 2 * 2e7 ** 3) / (150 * 60) ** 2,
  laps: 1,
  parts: [
    { caption: "החללית במנוחה ביחס למרכז הכוכב. איזה תרשים מתאר אותה נכון?", ask: "?", until: 0.02 },
    { caption: "מגובה H הכוכב נראה בזווית של 60°. מה הרדיוס שלו?", ask: "R = ?", at: "planet", until: 0.02 },
    { caption: "במסלול מעגלי בגובה H, זמן המחזור 150 דקות. מה מסת הכוכב?", ask: "M = ?", at: "planet" },
    { caption: "מה תאוצת הנפילה החופשית על פני הכוכב?", ask: "g = ?", at: "planet" },
    { caption: "האם בזמן התנועה המעגלית צריך שהמנועים יפעלו?", ask: "?" },
  ],
});
