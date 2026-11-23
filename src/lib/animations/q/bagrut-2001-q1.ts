import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 2001 q1: from a roof, A is released at t = 0; at t = 1 s B is thrown down at 14 m/s (part ב2: at 10 m/s). y is down from the roof. */
const g = 10;
const withB = (vB: number) => ({
  init: { a: body(-1, 0, 0, 0), b: body(1, 0, 0, 0) },
  phases: [
    { end: "throwB", acc: { a: [0, -g] as [number, number], b: [0, 0] as [number, number] }, dur: () => 1, force: () => ({ a: [0, -g] as [number, number], b: [0, 0] as [number, number] }), until: (_s: unknown, t: number) => t >= 1 - 1e-12,
      jump: (s: Record<string, { vy: number }>) => { s.b.vy = -vB; } },
    { end: "meet", acc: { a: [0, -g] as [number, number], b: [0, -g] as [number, number] },
      dur: (s: Record<string, { y: number; vy: number }>) => (vB - 10 > 0 ? (s.b.y - s.a.y) / (s.a.vy - s.b.vy) : 1.5),
      force: () => ({ a: [0, -g] as [number, number], b: [0, -g] as [number, number] }),
      until: (s: Record<string, { y: number }>, t: number) => (vB - 10 > 0 ? s.b.y <= s.a.y : t >= 2.5 - 1e-12) },
  ],
  record: { vA1: ["throwB", (s: Record<string, { vy: number }>) => -s.a.vy] as [string, (s: never) => number] },
});
export const spec = storySpec({
  id: "bagrut-2001-q1",
  view: { x0: -14, x1: 14, y0: -28, y1: 2 },
  scale: 28,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scenarios: { fast: withB(14) as any, slow: withB(10) as any },
  order: { fast: ["throwB", "meet"], slow: ["throwB", "meet"] },
  answers: { "fast.meet": [2.25, 1e-9], "fast.vA1": [10, 1e-9] },
  parts: [
    { to: (m) => m.events["fast.meet"], pace: 1.2, caption: "כדור א' נופל מהרגע t = 0. איפה הוא נמצא בכל רגע, לפי הציר שמכוון כלפי מטה?" },
    { to: (m) => m.events["fast.meet"], pace: 1.2, caption: "כדור ב' נזרק כלפי מטה שנייה אחר כך. איפה הוא נמצא בכל רגע?" },
    { to: (m) => m.events["fast.meet"], pace: 1.2, hideClock: true, caption: "כדור ב' מהיר יותר ומשיג את כדור א'. מתי הם חולפים זה ליד זה?" },
    { to: () => 1, pace: 1.2, caption: "באיזו מהירות נע כדור א' ברגע שכדור ב' נזרק?" },
    { to: (m) => m.events["slow.meet"], pace: 1.2, caption: "אילו כדור ב' היה נזרק במהירות 10 m/s, האם הכדורים היו נפגשים?" },
  ],
  draw: (P, m, t, part) => {
    P.poly([[-14, 0], [-2.5, 0], [-2.5, -27], [-14, -27]]);
    P.ground(-27, -14, 14);
    P.arrow(3.5, 0, 3.5, -8, { tone: "line", w: 1.4 }); P.mono(3.5, -8, "y", { tone: "line", size: 12, dxPx: 8, anchor: "start" });
    const key = part === 4 ? "slow" : "fast";
    const s = m.state(t);
    const a = s[`${key}.a`], b = s[`${key}.b`];
    P.ball(a.x, a.y, { label: "א'" });
    P.ball(b.x, b.y, { tone: "b2", label: "ב'" });
    if (part === 0) askLabel(P, a.x, a.y, "y(t) = ?", -90, 4);
    if (part === 1) askLabel(P, b.x, b.y, "y(t) = ?", 16, 4);
    if (part === 2 && t >= m.events["fast.meet"] - 1e-9) askLabel(P, 0, a.y, "t = ?", 30, 4);
    if (part === 3 && t >= 1 - 1e-9) { P.arrowPx(a.x, a.y, 0, 34, { tone: "ask" }); askLabel(P, a.x, a.y, "v = ?", -60, 30); }
    if (part === 4) askLabel(P, 0, -4, "נפגשים?", 30, 0);
  },
});
