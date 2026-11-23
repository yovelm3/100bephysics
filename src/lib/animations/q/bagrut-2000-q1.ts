import { body, type State } from "../engine";
import { askLabel, askSpan, storySpec } from "../kits";

/** 2000 q1: ball A up from the foot of a 300 m building at 40 m/s; at the same moment B down from the roof at 20 m/s. */
const g = 10;
const free = (s: State) => ({ a: [0, s.a.y > 0 || s.a.vy > 0 ? -g : 0] as [number, number], b: [0, s.b.y > 0 ? -g : 0] as [number, number] });
export const spec = storySpec({
  id: "bagrut-2000-q1",
  view: { x0: -150, x1: 150, y0: -10, y1: 320 },
  scale: 300,
  story: {
    init: { a: body(-20, 0, 0, 40), b: body(20, 300, 0, -20) },
    phases: [
      { end: "topA", acc: { a: [0, -g], b: [0, -g] }, dur: (s) => s.a.vy / g, force: () => ({ a: [0, -g], b: [0, -g] }), until: (s) => s.a.vy <= 0 },
      // they pass each other: same height (closing speed 60 m/s from 300 m)
      { end: "meet", acc: { a: [0, -g], b: [0, -g] }, dur: (s) => (s.b.y - s.a.y) / (s.a.vy - s.b.vy), force: () => ({ a: [0, -g], b: [0, -g] }), until: (s) => s.a.y >= s.b.y },
      { end: "landB", acc: { a: [0, -g], b: [0, -g] }, dur: (s) => (s.b.vy + Math.sqrt(s.b.vy ** 2 + 2 * g * s.b.y)) / g, force: (s) => free(s), until: (s) => s.b.y <= 0,
        jump: (s) => { s.b.y = 0; s.b.vy = 0; } },
      { end: "landA", acc: { a: [0, -g], b: [0, 0] }, dur: (s) => (s.a.vy + Math.sqrt(s.a.vy ** 2 + 2 * g * s.a.y)) / g, force: () => ({ a: [0, -g], b: [0, 0] }), until: (s) => s.a.y <= 0 },
    ],
    record: { H: ["topA", (s) => s.a.y] },
  },
  order: ["topA", "meet", "landB", "landA"],
  answers: { H: [80, 1e-9], landA: [8, 1e-9], meet: [5, 1e-9] },
  parts: [
    { to: (m) => m.events.topA, pace: 0.8, caption: "כדור א' עולה ומאט עד שהוא נעצר. מה הגובה המרבי שלו?", },
    { to: (m) => m.events.landA, pace: 0.6, hideClock: true, caption: "כדור א' עולה, נעצר וחוזר לקרקע. מתי הוא פוגע בקרקע?" },
    { to: (m) => m.events.meet, pace: 0.6, hideClock: true, caption: "הכדורים נעים זה לקראת זה. מתי הם באותו גובה?" },
    { to: (m) => m.events.meet, pace: 0.6, caption: "איך משתנה המרחק בין שני הכדורים מהזריקה ועד המפגש?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -140, 140);
    P.poly([[30, 0], [110, 0], [110, 300], [30, 300]]);
    P.dim(120, 0, 120, 300, "300 m", { offPx: -14 });
    const s = m.state(t);
    P.ball(s.a.x, s.a.y, { label: "א'" });
    P.ball(s.b.x, s.b.y, { tone: "b2", label: "ב'" });
    if (t < 0.3) { P.arrowPx(-20, 12, 0, -40, { tone: "data", label: "40 m/s" }); P.arrowPx(20, 310, 0, 30, { tone: "data", label: "20 m/s" }); }
    if (part === 0 && t >= m.events.topA - 1e-9) askSpan(P, -20, 0, m.values.H, "H = ?", -40);
    if (part === 1 && t >= m.events.landA - 1e-9) askLabel(P, -20, 0, "t = ?", -60, -30);
    if (part === 2 && t >= m.events.meet - 1e-9) askLabel(P, 0, s.a.y, "t = ?", -80, 0);
    if (part === 3) askSpan(P, 0, s.a.y, s.b.y, "d(t) ?", 0);
  },
});
