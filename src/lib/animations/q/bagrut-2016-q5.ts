import { orbitSpec } from "./_space";

/** 2016 q5: Tim in a shuttle in a circular orbit; Jim in a rover on the surface of a planet that does not turn (R = 1.53·10⁷ m from the answer). */
export const spec = orbitSpec({
  id: "bagrut-2016-q5",
  R: 1.5318627450980391e7,
  r: 1.25 * 1.5318627450980391e7,
  gm: 6.67e-11 * 7.036292263326237e25,
  laps: 1, showA: true,
  extra: (P, _c, t) => { const a = Math.PI / 2 + t * 1.25e4 / 1.5318627450980391e7; P.block(1.5318627450980391e7 * Math.cos(a), 1.5318627450980391e7 * Math.sin(a), { wPx: 16, hPx: 10, tone: "runner", base: false }); },
  parts: [
    { caption: "על מי הכיסא מפעיל כוח גדול יותר: על טים במעבורת, או על ג'ים ברכב?", ask: "?" },
    { caption: "ג'ים מתחיל לנסוע על פני הכוכב. איך משתנה ההוריה של מד המשקל?", ask: "N ?", at: "planet" },
    { caption: "במהירות 1.25·10⁴ m/s המד מראה 980 N. מה הרדיוס של הכוכב?", ask: "R = ?", at: "planet" },
    { caption: "מה המסה של הכוכב?", ask: "M = ?", at: "center" },
    { caption: "מה הקשר בין התאוצה של המעבורת לבין תאוצת הכובד בגובה שלה?", ask: "a ? g*" },
  ],
});
