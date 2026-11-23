import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 2009 q1: A up from a 45 m roof at 40 m/s, B up from the foot at 55 m/s, at the same moment; they pass at 120 m. */
const g = 10;
export const spec = storySpec({
  id: "bagrut-2009-q1",
  view: { x0: -90, x1: 110, y0: -6, y1: 170 },
  scale: 160,
  story: {
    init: { a: body(14, 45, 0, 40), b: body(-14, 0, 0, 55) },
    phases: [
      { end: "pass", acc: { a: [0, -g], b: [0, -g] }, dur: (s) => (s.a.y - s.b.y) / (s.b.vy - s.a.vy), force: () => ({ a: [0, -g], b: [0, -g] }), until: (s) => s.b.y >= s.a.y },
      { end: "topA", acc: { a: [0, -g], b: [0, -g] }, dur: (s) => s.a.vy / g, force: () => ({ a: [0, -g], b: [0, -g] }), until: (s) => s.a.vy <= 0 },
      { end: "sameSpeed", acc: { a: [0, -g], b: [0, -g] }, dur: (s) => (s.b.vy + s.a.vy) / (2 * g), force: () => ({ a: [0, -g], b: [0, -g] }), until: (s) => s.b.vy <= -s.a.vy },
    ],
    record: { yPass: ["pass", (s) => s.a.y] },
  },
  order: ["pass", "topA", "sameSpeed"],
  answers: { yPass: [120, 1e-6], sameSpeed: [4.75, 1e-9] },
  parts: [
    { to: (m) => m.events.pass, pace: 0.6, caption: "שני הכדורים עולים, ו-B מהיר יותר. באיזה גובה הם חולפים זה ליד זה?" },
    { to: (m) => m.events.sameSpeed, pace: 0.6, caption: "האם יש רגע שבו וקטורי המהירות של שני הכדורים שווים?" },
    { to: (m) => m.events.sameSpeed, pace: 0.6, hideClock: true, caption: "האם יש רגע שבו גודלי המהירויות שווים? אם כן, מתי?" },
    { to: (m) => m.events.pass, pace: 0.6, caption: "ציר מקום שנע יחד עם כדור B. מה התאוצה של כדור A לפי הציר הזה?" },
    { to: () => 0.05, pace: 0.6, caption: "מה המהירות של כדור A ברגע הזריקה, לפי הציר שנע עם B?" },
    { to: (m) => m.events.pass, pace: 0.6, caption: "איך נראה המקום של כדור A לפי הציר שנע עם B, עד שהם חולפים זה ליד זה?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -80, 100);
    P.poly([[20, 0], [70, 0], [70, 45], [20, 45]]);
    P.dim(78, 0, 78, 45, "45 m", { offPx: -12 });
    const s = m.state(t);
    P.ball(s.a.x, s.a.y, { label: "A" });
    P.ball(s.b.x, s.b.y, { tone: "b2", label: "B" });
    P.arrowPx(s.a.x + 6, s.a.y + 4, 0, -s.a.vy * 1.1, { tone: "vel" });
    P.arrowPx(s.b.x - 6, s.b.y + 4, 0, -s.b.vy * 1.1, { tone: "vel" });
    if (part === 0 && t >= m.events.pass - 1e-9) askLabel(P, 0, s.a.y, "h = ?", 30, 0);
    if (part === 1) askLabel(P, 0, 150, "v⃗A = v⃗B ?", -40, 0);
    if (part === 2 && t >= m.events.sameSpeed - 1e-9) askLabel(P, 0, 150, "t = ?", -20, 0);
    if (part >= 3) { P.arrow(s.b.x - 22, s.b.y, s.b.x - 22, s.b.y + 30, { tone: "b2", w: 1.4 }); P.mono(s.b.x - 22, s.b.y + 30, "y*", { tone: "b2", size: 12, dyPx: -6 }); }
    if (part === 3) askLabel(P, s.a.x, s.a.y, "a* = ?", 14, -10);
    if (part === 4) askLabel(P, s.a.x, s.a.y, "v* = ?", 14, -10);
    if (part === 5) askLabel(P, s.a.x, s.a.y, "y*(t) ?", 14, -10);
  },
});
