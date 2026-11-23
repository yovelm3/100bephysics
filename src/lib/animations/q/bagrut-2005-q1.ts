import { body } from "../engine";
import { askLabel, askWidth, fallPhase, storySpec } from "../kits";

/** 2005 q1: a spring toy shoots a ball 2.45 m up from the basket; part ד: Yossi glides right at 3 m/s; part ה: he stops when the ball is at the top. */
const v0 = Math.sqrt(2 * 10 * 2.45), u = 3;
const up = { end: "top", acc: { b: [0, -10] as [number, number], k: [0, 0] as [number, number] }, dur: (s: Record<string, { vy: number }>) => s.b.vy / 10, force: () => ({ b: [0, -10] as [number, number], k: [0, 0] as [number, number] }), until: (s: Record<string, { vy: number }>) => s.b.vy <= 0 };
export const spec = storySpec({
  id: "bagrut-2005-q1",
  view: { x0: -1, x1: 6, y0: -1.5, y1: 3.2 },
  scale: 5,
  scenarios: {
    still: { init: { b: body(0, 0, 0, v0), k: body(0, 0) }, phases: [up, fallPhase({ end: "back", body: "b", toY: 0, others: { k: [0, 0] } })] },
    glide: { init: { b: body(0, 0, u, v0), k: body(0, 0, u, 0) }, phases: [up, fallPhase({ end: "back", body: "b", toY: 0, others: { k: [0, 0] } })], record: { gap: ["back", (s) => s.b.x - s.k.x] } },
    stop: {
      init: { b: body(0, 0, u, v0), k: body(0, 0, u, 0) },
      phases: [{ ...up, jump: (s) => { s.k.vx = 0; } }, fallPhase({ end: "back", body: "b", toY: 0, others: { k: [0, 0] } })],
      record: { gap: ["back", (s) => s.b.x - s.k.x] },
    },
  },
  order: { still: ["top", "back"], glide: ["top", "back"], stop: ["top", "back"] },
  answers: { "still.back": [1.4, 1e-9], "glide.gap": [0, 1e-6], "stop.gap": [2.1, 1e-6] },
  tolValue: { "glide.gap": 1e-3 },
  parts: [
    { to: (m) => m.events["still.back"], pace: 1.5, caption: "הכדור עולה, נעצר בשיא ונופל בחזרה לסלסילה. איך נראה גרף המהירות שלו?" },
    { to: (m) => m.events["still.back"], pace: 1.5, caption: "איך נראה גרף המקום של הכדור?" },
    { to: (m) => m.events["still.back"], pace: 1.5, hideClock: true, caption: "כמה זמן נמשכת התנועה, עד שהכדור חוזר לתחתית הסלסילה?" },
    { to: (m) => m.events["glide.back"], pace: 1.5, caption: "יוסי נוסע ימינה במהירות קבועה ומקפיץ את הכדור. האם הכדור ייפול בחזרה לסלסילה?" },
    { to: (m) => m.events["stop.back"], pace: 1.5, caption: "בשיא יוסי נעצר. באיזה מרחק מהסלסילה נוחת הכדור?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(-1.2, -1, 6);
    const key = part === 3 ? "glide" : part === 4 ? "stop" : "still";
    const s = m.state(t), b = s[`${key}.b`], k = s[`${key}.k`];
    P.person(k.x - 0.35, -1.2, t, { tone: "runner", moving: Math.abs(k.vx) > 0 });
    P.poly([[k.x - 0.22, 0.12], [k.x + 0.22, 0.12], [k.x, -0.15]], { tone: "line" });
    P.ball(b.x, b.y);
    if (part === 4 && t >= m.events["stop.back"] - 1e-9) askWidth(P, k.x, b.x, 0, "d = ?", 26);
    if (part === 2 && t >= m.events["still.back"] - 1e-9) askLabel(P, 0, 0.3, "t = ?", 20, 0);
    if (part === 3 && t >= m.events["glide.back"] - 1e-9) askLabel(P, b.x, 0.5, "?", 20, 0);
  },
});
