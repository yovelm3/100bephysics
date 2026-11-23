import { body } from "../engine";
import { askLabel, askSpan, askWidth, fallPhase, storySpec } from "../kits";

/** 2001 q2: a balloon rises at 5 m/s and drifts at 4.5 m/s; a stone leaves the basket at A, 4 m above P, and lands at Q. */
export const spec = storySpec({
  id: "bagrut-2001-q2",
  view: { x0: -1.5, x1: 9, y0: -0.6, y1: 16.5 },
  scale: 12,
  story: {
    init: { s: body(0, 4, 4.5, 5), bal: body(0, 4, 4.5, 5) },
    phases: [{ ...fallPhase({ end: "Q", body: "s", toY: 0, others: { bal: [0, 0] } }) }],
    record: { vyQ: ["Q", (s) => -s.s.vy], xQ: ["Q", (s) => s.s.x], balX: ["Q", (s) => s.bal.x], balY: ["Q", (s) => s.bal.y] },
  },
  order: ["Q"],
  answers: { vyQ: [Math.sqrt(105), 1e-9] },
  parts: [
    { to: (m) => m.events.Q, pace: 2, caption: "האבן משתחררת מהסל, שעולה ונסחף ברוח. איך נראה המסלול שלה מ-A ועד Q?" },
    { to: (m) => m.events.Q, pace: 2, caption: "מה הרכיב האנכי של מהירות האבן כשהיא מגיעה ל-Q?" },
    { to: (m) => m.events.Q, pace: 2, caption: "באיזו זווית ביחס לאופק פוגעת האבן בקרקע?" },
    { to: (m) => m.events.Q, pace: 2, caption: "ברגע שהאבן פוגעת בקרקע, איפה נמצא הכדור הפורח ביחס ל-Q?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -1.4, 8.8);
    P.circle(0, 0, 3, { fill: "line" }); P.mono(0, 0, "P", { size: 12, dyPx: 18 });
    P.circle(0, 4, 3, { fill: "data" }); P.mono(0, 4, "A", { size: 12, dxPx: -12 });
    P.dim(-0.8, 0, -0.8, 4, "4 m");
    const s = m.state(t), end = t >= m.events.Q - 1e-9;
    const bx = P.sx(s.bal.x), by = P.sy(s.bal.y);
    P.path(Array.from({ length: 33 }, (_, i) => [bx + 20 * Math.cos((i / 32) * 2 * Math.PI), by - 52 + 20 * Math.sin((i / 32) * 2 * Math.PI)] as [number, number]), { tone: "line", w: 2 });
    P.path([[bx - 9, by - 10], [bx + 9, by - 10], [bx + 9, by], [bx - 9, by], [bx - 9, by - 10]], { tone: "line", w: 1.8 });
    if (t < 0.25) { P.arrowPx(s.bal.x, s.bal.y, 0, -36, { tone: "data", label: "5 m/s" }); P.arrowPx(s.bal.x, s.bal.y, 32, 0, { tone: "data", label: "4.5 m/s" }); }
    P.ball(s.s.x, s.s.y, { rPx: 5 });
    if (end) { P.circle(s.s.x, 0, 3, { fill: "line" }); P.mono(s.s.x, 0, "Q", { size: 12, dyPx: 18 }); }
    if (part === 1 && end) { P.arrowPx(s.s.x, 0.3, 0, 40, { tone: "ask" }); askLabel(P, s.s.x, 0.3, "vᵧ = ?", 10, 30); }
    if (part === 2 && end) askLabel(P, s.s.x, 0, "θ = ?", 12, -12);
    if (part === 3 && end) { askWidth(P, s.s.x, s.bal.x, 0, "?", -12); askSpan(P, s.bal.x + 0.5, 0, s.bal.y, "?", 0); }
  },
});
