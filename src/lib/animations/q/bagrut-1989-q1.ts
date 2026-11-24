import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1989 q1: a smooth board ABCD tilted 30°, seen from straight above its surface: down the board is down the page.
 * From E (2.5 m from DA, 1.5 m from CD) a ball is thrown along the board parallel to BC; along the board it accelerates
 * at g·sin 30° = 5 m/s² downhill. With v0 = 1.5 m/s it reaches the corner D after 1 s.
 */
const a = 10 * Math.sin(Math.PI / 6), W = 4, H = 3.5;
export const spec = storySpec({
  id: "bagrut-1989-q1",
  view: { x0: -0.6, x1: 4.8, y0: -0.4, y1: 3.9 },
  scale: 4,
  story: {
    init: { b: body(W - 1.5, 2.5, 1.5, 0) },
    // build 2: weight and the board's normal force; their sum is the weight's part along the board, downhill
    phases: [{ end: "D", acc: { b: [0, -a] }, dur: () => Math.sqrt((2 * 2.5) / a), force: () => ({ b: [0, -10 * Math.sin(Math.PI / 6)] }), until: (s) => s.b.y <= 0 }],
    record: { xD: ["D", (s) => s.b.x], vD: ["D", (s) => Math.hypot(s.b.vx, s.b.vy)] },
  },
  order: ["D"],
  answers: { xD: [W, 1e-9], vD: [Math.hypot(1.5, 5), 1e-9] },
  parts: [
    { to: (m) => m.events.D, pace: 2, caption: "אילו כוחות פועלים על הכדור בזמן שהוא נע על הלוח?" },
    { to: (m) => m.events.D, pace: 2, caption: "מה צורת המסלול של הכדור על הלוח?" },
    { to: (m) => m.events.D, pace: 2, caption: "מה צריכה להיות v0 כדי שהכדור יגיע לנקודה D? מה גודל המהירות שלו ב-D?" },
  ],
  draw: (P, m, t, part) => {
    P.poly([[0, 0], [W, 0], [W, H], [0, H]]);
    for (const [l, x, y] of [["A", 0, 0], ["D", W, 0], ["C", W, H], ["B", 0, H]] as const) P.mono(x, y, l, { tone: "data", size: 12, dxPx: x ? 12 : -12, dyPx: y ? -6 : 14 });
    P.arrow(-0.35, 2.6, -0.35, 1.6, { tone: "data", w: 1.2 }); P.heb(-0.35, 1.4, "במורד", { tone: "data", size: 10 });
    P.circle(W - 1.5, 2.5, 3, { fill: "data" }); P.mono(W - 1.5, 2.5, "E", { tone: "data", size: 12, dyPx: -10 });
    const b = m.state(t).b;
    if (part === 1 || part === 2) { const path = Array.from({ length: 31 }, (_, i) => { const q = m.state((t * i) / 30).b; return [q.x, q.y] as [number, number]; }); P.poly(path, { close: false, fill: "none", tone: "idle", w: 1.2, dash: "4 4" }); }
    P.circle(b.x, b.y, 7, { fill: "body" });
    P.arrowPx(b.x, b.y, b.vx * 14, -b.vy * 14, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, b.x, b.y, "?", -30, -20);
    if (part === 1) askLabel(P, 1.5, 1.5, "?", 0, 0);
    if (part === 2) { askLabel(P, W - 1.5, 2.5, "v0 = ?", -40, -20); if (t >= m.events.D - 1e-9) askLabel(P, W, 0, "v = ?", -40, -30); }
  },
});
