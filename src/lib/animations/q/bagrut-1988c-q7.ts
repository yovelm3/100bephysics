import { body, type Story } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 1988c q7: a ball thrown straight up (drawn 10 m/s) and back; without air drag, and with a constant drag (drawn 2 m/s² per unit mass). */
const g = 10, v0 = 10;
const run = (d: number): Story => ({
  init: { b: body(0, 0, 0, v0) },
  phases: [
    { end: "top", acc: { b: [0, -(g + d)] }, dur: (s) => s.b.vy / (g + d), force: (s) => ({ b: [0, -g - Math.sign(s.b.vy || 1) * d] }), until: (s) => s.b.vy <= 0 },
    { end: "back", acc: { b: [0, -(g - d)] }, dur: (s) => Math.sqrt((2 * s.b.y) / (g - d)), force: (s) => ({ b: [0, -g + (s.b.vy < 0 ? d : 0)] }), until: (s) => s.b.y <= 0 },
  ],
});
export const spec = storySpec({
  id: "bagrut-1988c-q7",
  view: { x0: -4, x1: 4, y0: -0.4, y1: 5.6 },
  scale: 5,
  scenarios: { free: run(0), drag: run(2) },
  order: { free: ["top", "back"], drag: ["top", "back"] },
  answers: { "free.back": [2, 1e-9] },
  parts: [{ to: (m) => m.events["free.back"], pace: 1.2, hideClock: true, caption: "בלי התנגדות האוויר (משמאל) זמן העלייה שווה לזמן הירידה. עם התנגדות קבועה (מימין): האם זמן העלייה קטן מזמן הירידה, גדול ממנו או שווה לו?" }],
  draw: (P, m, t) => {
    P.ground(0, -3.8, 3.8);
    for (const [k, x] of [["free", -1.2], ["drag", 1.2]] as const) {
      const b = m.state(Math.min(t, m.events[`${k}.back`]))[`${k}.b`];
      P.ball(x, b.y, { rPx: 7, tone: k === "free" ? "body" : "b2" });
      if (Math.abs(b.vy) > 0.2) P.arrowPx(x + 0.4, b.y + 0.1, 0, -b.vy * 3, { tone: "vel", label: "v" });
    }
    askLabel(P, 1.2, 5, "t↑ ? t↓", 0, 0);
  },
});
