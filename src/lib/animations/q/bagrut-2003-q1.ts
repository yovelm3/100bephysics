import { body, type State } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 2003 q1: stone 1 up at 10 m/s at t = 0; stone 2 up at 12 m/s from the same point at T = 0.5 s. */
const g = 10, v1 = 10, v2 = 12, T = 0.5;
const fly = (s: State, k: "a" | "b") => (s[k].y > 0 || s[k].vy > 0 ? -g : 0);
export const spec = storySpec({
  id: "bagrut-2003-q1",
  view: { x0: -6, x1: 8, y0: -0.6, y1: 8.5 },
  scale: 8,
  story: {
    init: { a: body(-0.6, 0, 0, v1), b: body(0.6, 0, 0, 0) },
    phases: [
      { end: "throw2", acc: { a: [0, -g], b: [0, 0] }, dur: () => T, force: (s) => ({ a: [0, fly(s, "a")], b: [0, 0] }), until: (_s, t) => t >= T - 1e-12, jump: (s) => { s.b.vy = v2; } },
      { end: "pass", acc: { a: [0, -g], b: [0, -g] }, dur: (s) => (s.a.y - s.b.y) / (s.b.vy - s.a.vy), force: (s) => ({ a: [0, fly(s, "a")], b: [0, -g] }), until: (s) => s.b.y >= s.a.y },
      { end: "land1", acc: { a: [0, -g], b: [0, -g] }, dur: (s) => (s.a.vy + Math.sqrt(s.a.vy ** 2 + 2 * g * s.a.y)) / g, force: () => ({ a: [0, -g], b: [0, -g] }), until: (s) => s.a.y <= 0 && s.a.vy < 0, jump: (s) => { s.a.y = 0; s.a.vy = 0; } },
      { end: "land2", acc: { a: [0, 0], b: [0, -g] }, dur: (s) => (s.b.vy + Math.sqrt(s.b.vy ** 2 + 2 * g * s.b.y)) / g, force: () => ({ a: [0, 0], b: [0, -g] }), until: (s) => s.b.y <= 0 && s.b.vy < 0 },
    ],
  },
  order: ["throw2", "pass", "land1", "land2"],
  answers: { pass: [29 / 28, 1e-9], land1: [2, 1e-9], land2: [2.9, 1e-9] },
  parts: [
    { to: (m) => m.events.land1, pace: 1.5, caption: "אבן 1 נזרקת כלפי מעלה ברגע t = 0. איפה היא נמצאת בכל רגע?" },
    { to: (m) => m.events.land2, pace: 1.5, caption: "אבן 2 נזרקת מאותה נקודה אחרי זמן T. איפה היא נמצאת בכל רגע מהרגע הזה?" },
    { to: (m) => m.events.pass, pace: 1.5, hideClock: true, caption: "אבן 2 מהירה יותר ומשיגה את אבן 1. מתי היא חולפת על פניה?" },
    { to: (m) => m.events.land2, pace: 1.5, hideClock: true, caption: "שתי האבנים חוזרות לקרקע. כמה זמן אחרי הראשונה נוחתת השנייה?" },
    { to: (m) => m.events.land2, pace: 1.5, caption: "איך נראים גרפי המקום של שתי האבנים, באותה מערכת צירים?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -5.5, 7.5);
    P.arrow(-3, 0, -3, 7.8, { tone: "line", w: 1.4 }); P.mono(-3, 7.8, "y", { tone: "line", size: 12, dxPx: 8, anchor: "start" });
    const s = m.state(t);
    P.ball(s.a.x, s.a.y, { label: "1" });
    if (t >= T - 1e-9 || part !== 0) P.ball(s.b.x, s.b.y, { tone: "b2", label: "2" });
    if (part === 0) askLabel(P, -3, s.a.y, "y₁(t) = ?", -90, 4);
    if (part === 1 && t >= T) askLabel(P, -3, s.b.y, "y₂(t) = ?", -90, 4);
    if (part === 2 && t >= m.events.pass - 1e-9) askLabel(P, 0.6, s.b.y, "t = ?", 16, 0);
    if (part === 3 && t >= m.events.land2 - 1e-9) askLabel(P, 0, 0, "Δt = ?", 30, -16);
    if (part === 4) askLabel(P, 2, 6, "y₁(t), y₂(t) ?", 0, 0);
  },
});
