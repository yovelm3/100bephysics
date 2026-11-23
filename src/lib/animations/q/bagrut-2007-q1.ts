import { askLabel, graphMotion } from "../kits";

/** 2007 q1: Yael on a curved water slide; the distance along the slide every 0.4 s comes from the video (table). */
const T = [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6];
const S = [0, 0.9, 1.76, 3.62, 5.04, 7.22, 8.88, 11.26, 13.08, 15.54];
// speeds at the measured moments from the table (central differences), joined by straight lines
const V: [number, number][] = [[0, 1], ...T.slice(1, -1).map((t, k): [number, number] => [t, (S[k + 2] - S[k]) / 0.8])];
const slide: [number, number][] = Array.from({ length: 121 }, (_, i) => {
  const u = i / 120;
  return [0.5 + 13 * u, 6.2 * (1 - u) ** 1.3 + 0.55 * Math.sin(u * 3 * Math.PI)];
});
export const spec = graphMotion({
  id: "bagrut-2007-q1",
  panel: "none",
  along: slide,
  strobe: { every: 0.4 },
  v: V,
  range: [0, 14],
  graph: { vMin: 0, vMax: 7 },
  answers: { "v@c4": [(S[5] - S[3]) / 0.8, 1e-9] },
  parts: [
    { to: () => 1.6, pace: 1.6, caption: "המקום של יעל לאורך המגלשה כל 0.4 s. מה גודל המהירות שלה ברגע t = 1.6 s?" },
    { to: () => 3.2, pace: 1.6, caption: "באותה דרך: מה גודל המהירות בכל רגע מ-0.4 עד 3.2 שניות?" },
    { to: () => 3.2, pace: 1.6, caption: "איך נראה גרף של גודל המהירות כפונקציה של הזמן?" },
    { to: () => 3.2, pace: 1.6, caption: "גודל המהירות משתנה לאורך הגלישה. האם הייתה ליעל תאוצה משיקית?" },
    { to: () => 3.2, pace: 1.6, caption: "המגלשה עקומה, וכיוון התנועה משתנה. האם הייתה ליעל תאוצה רדיאלית?" },
  ].map((p, i) => ({ ...p, ask: i === 0 ? (P: import("../engine").Painter) => askLabel(P, 6, 4.5, "v(1.6) = ?", 0, 0) : undefined })),
});
