import { body } from "../engine";

import { askLabel, fallPhase, storySpec } from "../kits";

/** 1994 q1: a stone thrown straight up at 40 m/s from the ground; a balloon rises at a constant 10 m/s beside it. */
const envelope = (P: import("../engine").Painter, x: number, y: number) => {
  // the balloon: a circle of 22 px above the basket
  P.path(Array.from({ length: 33 }, (_, i) => [P.sx(x) + 22 * Math.cos((i / 32) * 2 * Math.PI), P.sy(y) - 56 + 22 * Math.sin((i / 32) * 2 * Math.PI)] as [number, number]), { tone: "line", w: 2 });
};

export const spec = storySpec({
  id: "bagrut-1994-q1",
  view: { x0: -70, x1: 90, y0: -6, y1: 104 },
  scale: 90,
  story: {
    init: { s: body(-20, 0, 0, 40), bal: body(15, 0, 0, 10) },
    phases: [
      { end: "top", acc: { s: [0, -10], bal: [0, 0] }, dur: (st) => st.s.vy / 10, force: () => ({ s: [0, -10], bal: [0, 0] }), until: (st) => st.s.vy <= 0 },
      { ...fallPhase({ end: "hit", body: "s", toY: 0, others: { bal: [0, 0] } }) },
    ],
    marks: { relStop: [() => 3, (st) => st.s.vy - st.bal.vy <= 0] },
    record: { H: ["top", (st) => st.s.y] },
  },
  order: ["relStop", "top", "hit"],
  answers: { top: [4, 1e-9], relStop: [3, 1e-9], hit: [8, 1e-9] },
  parts: [
    { to: (m) => m.events.top + 0.6, pace: 1, hideClock: true, caption: "האבן עולה ומאטה. מתי המהירות שלה מתאפסת, לפי מי שעומד על הקרקע?" },
    { to: (m) => m.events.hit, pace: 1, caption: "מהזריקה ועד הפגיעה בקרקע: איך משתנים המקום, המהירות והתאוצה של האבן?" },
    { to: (m) => m.events.hit, pace: 1, hideClock: true, caption: "אדם בכדור פורח עולה במהירות קבועה. מתי האבן נראית לו עוצרת? ואיך נראית לו המהירות שלה לאורך הזמן?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -66, 86);
    const st = m.state(t);
    P.ball(st.s.x, st.s.y, { rPx: 7 });
    P.arrowPx(st.s.x, st.s.y + 3, 0, -st.s.vy * 1.4, { tone: "vel", label: "v" });
    if (part === 0 && t >= m.events.top - 1e-9) askLabel(P, -20, m.values.H, "t = ?", 16, 0);
    if (part === 1) {
      P.line(-30, 0, -30, 85, { tone: "line", w: 1.2 }); P.mono(-30, 85, "y", { tone: "line", size: 12, dyPx: -6 });
      P.line(-32, st.s.y, -28, st.s.y, { tone: "ask", w: 2 }); askLabel(P, -30, st.s.y, "y = ?", -58, 4);
    }
    if (part === 2) {
      const b = st.bal;
      const bx = P.sx(b.x), by = P.sy(b.y);
      envelope(P, b.x, b.y);
      P.path([[bx - 9, by - 12], [bx - 14, by - 34]], { tone: "line", w: 1.4 }); P.path([[bx + 9, by - 12], [bx + 14, by - 34]], { tone: "line", w: 1.4 });
      P.path([[bx - 10, by], [bx + 10, by], [bx + 10, by - 12], [bx - 10, by - 12], [bx - 10, by]], { tone: "line", w: 1.8 });
      P.arrowScreen(bx + 30, by - 20, bx + 30, by - 50, { tone: "data", w: 2.2 });
      P.textPx(bx + 36, by - 32, "10 m/s", { tone: "data", size: 11, anchor: "start" });
      P.heb(b.x, b.y, "המהירות של האבן לפי האדם?", { tone: "ask", anchor: "end", dxPx: 44, dyPx: -50, size: 13 });
    }
  },
});
