import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2009 q1: A up from a 45 m roof at 40 m/s, B up from the foot at 55 m/s, at the same moment; they pass at 120 m.
 * Pilot of the upgraded standard: each part shows its own data when it acts, stops at its key moments, and shows the
 * physics that matters for it (never a computed value).
 */
const g = 10;
const yPass = 120;
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
  answers: { yPass: [yPass, 1e-6], sameSpeed: [4.75, 1e-9] },
  parts: [
    { to: (m) => m.events.pass, pace: 0.6, caption: "שני הכדורים נזרקים באותו רגע, ו-B מהיר יותר. באיזה גובה הם חולפים זה ליד זה?",
      holds: (m) => [{ at: m.events.pass, label: "חולפים זה ליד זה", where: [0, yPass] }] },
    { to: (m) => m.events.topA + 0.6, pace: 0.6, caption: "האם יש רגע שבו וקטורי המהירות של שני הכדורים שווים? הסתכלו על הכיוון ועל הגודל של כל חץ.",
      holds: (m) => [{ at: m.events.topA, label: "A בשיא: המהירות שלו מתהפכת", where: [14, m.state(m.events.topA).a.y] }] },
    { to: (m) => m.events.sameSpeed + 0.3, pace: 0.6, hideClock: true, caption: "עכשיו רק הגודל: מתי אורכי שני החצים שווים? (הכיוון לא משנה כאן.)",
      holds: (m) => [{ at: m.events.topA, label: "A מתחיל לרדת", where: [14, m.state(m.events.topA).a.y] }] },
    { to: (m) => m.events.pass, pace: 0.6, caption: "ציר מקום y* שנע יחד עם B. לשני הכדורים אותה תאוצה כלפי מטה. מה התאוצה של A לפי הציר של B?" },
    { to: () => 0.25, pace: 0.6, caption: "ברגע הזריקה: מה המהירות של A לפי הציר שנע עם B?" },
    { to: (m) => m.events.pass, pace: 0.6, caption: "המרחק y* בין A ל-B לאורך הזמן: איך נראה המקום של A לפי הציר של B?",
      holds: (m) => [{ at: m.events.pass, label: "y* מתאפס", where: [0, yPass] }] },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -80, 100);
    P.poly([[20, 0], [70, 0], [70, 45], [20, 45]]);
    P.dim(78, 0, 78, 45, "45 m", { offPx: -12 });
    const s = m.state(t);
    // the throw speeds are data: shown at the throw, at the balls
    if (t < 0.35 && part !== 4) { P.mono(14, 45, "40 m/s", { tone: "data", size: 12, dxPx: 16, dyPx: -30 }); P.mono(-14, 0, "55 m/s", { tone: "data", size: 12, dxPx: -16, dyPx: -30, anchor: "end" }); }
    P.ball(s.a.x, s.a.y, { label: "A" });
    P.ball(s.b.x, s.b.y, { tone: "b2", label: "B" });
    const vScale = 1.1;
    if (part !== 3 && part !== 5) {
      P.arrowPx(s.a.x + 6, s.a.y + 4, 0, -s.a.vy * vScale, { tone: "vel", label: part === 1 || part === 2 ? "vA" : undefined });
      P.arrowPx(s.b.x - 6, s.b.y + 4, 0, -s.b.vy * vScale, { tone: "vel", label: part === 1 || part === 2 ? "vB" : undefined });
    }
    if (part === 0) {
      // the two heights, compared on one line
      P.line(-40, s.a.y, 40, s.a.y, { tone: "idle", w: 1, dash: "4 4" });
      if (t >= m.events.pass - 1e-9) askLabel(P, 0, s.a.y, "h = ?", 40, -16);
    }
    if (part === 1) askLabel(P, -60, 120, "vA = vB ?", 0, 0);
    if (part === 2) askLabel(P, -60, 120, "|vA| = |vB| ?  t = ?", 0, 0);
    if (part >= 3) {
      // the axis that moves with B, and the same acceleration on both balls
      P.arrow(s.b.x - 22, s.b.y, s.b.x - 22, s.b.y + 30, { tone: "b2", w: 1.4 });
      P.mono(s.b.x - 22, s.b.y + 30, "y*", { tone: "b2", size: 12, dyPx: -6 });
      if (part === 3) { P.arrowPx(s.a.x + 8, s.a.y, 0, 26, { tone: "force", label: "g" }); P.arrowPx(s.b.x - 8, s.b.y, 0, 26, { tone: "force", label: "g" }); askLabel(P, s.a.x, s.a.y, "a* = ?", 14, -10); }
      if (part === 4) { P.mono(14, 45, "40 m/s", { tone: "data", size: 12, dxPx: 16, dyPx: -30 }); P.mono(-14, 0, "55 m/s", { tone: "data", size: 12, dxPx: -16, dyPx: -30, anchor: "end" }); askLabel(P, s.a.x, s.a.y, "v* = ?", 14, -10); }
      if (part === 5) { P.line(0, s.b.y, 0, s.a.y, { tone: "ask", w: 2, dash: "4 3" }); askLabel(P, 0, (s.a.y + s.b.y) / 2, "y*(t) ?", 10, 0); }
    }
  },
});
