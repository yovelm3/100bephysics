import { body } from "../engine";
import { askLabel, askWidth, storySpec } from "../kits";

/**
 * 1991 q3 (from above): cart K moves along the track at 0.2 m/s; a smooth wall is parallel, 1 m away. Opposite M the
 * ball is thrown toward the wall at 0.2 m/s relative to the cart, bounces elastically, and comes back.
 * x: along the track from M; y: toward the wall.
 */
const v = 0.2, D = 1;
export const spec = storySpec({
  id: "bagrut-1991-q3",
  view: { x0: -0.4, x1: 2.6, y0: -0.4, y1: 1.4 },
  scale: 2,
  story: {
    init: { k: body(0, 0, v, 0), b: body(0, 0, v, v) },
    phases: [
      { end: "wall", acc: {}, dur: () => D / v, force: () => ({}), until: (s) => s.b.y >= D, jump: (s) => { s.b.vy = -s.b.vy; } },
      { end: "meet", acc: {}, dur: () => D / v, force: () => ({}), until: (s) => s.b.y <= 0 },
    ],
    record: { xWall: ["wall", (s) => s.b.x], speed: ["wall", (s) => Math.hypot(s.b.vx, s.b.vy)], xMeet: ["meet", (s) => s.k.x], gap: ["meet", (s) => s.b.x - s.k.x] },
  },
  order: ["wall", "meet"],
  answers: { xWall: [1, 1e-9], speed: [0.28284271247461906, 1e-9], xMeet: [2, 1e-9], gap: [0, 1e-9] },
  parts: [
    { to: (m) => m.events.wall, pace: 0.3, caption: "זורקים את הכדור לכיוון הקיר, בניצב למסילה ביחס לקרונית. מה צורת המסלול שלו עד הקיר?" },
    { to: (m) => m.events.wall, pace: 0.3, caption: "באיזה מרחק מ-M פוגע הכדור בקיר?" },
    { to: (m) => m.events.wall, pace: 0.3, caption: "האם מהירות הקרונית אחרי הזריקה קטנה, גדלה או לא משתנה?" },
    { from: (m) => m.events.wall - 1, to: (m) => m.events.wall + 1.5, pace: 0.3, caption: "באיזו מהירות, בגודל ובכיוון, חוזר הכדור מהקיר?" },
    { to: (m) => m.events.meet, pace: 0.3, hideClock: true, caption: "האם הכדור והקרונית ייפגשו? אם כן, היכן?" },
  ],
  draw: (P, m, t, part) => {
    P.line(-0.3, -0.05, 2.5, -0.05, { tone: "line", w: 2 }); P.line(-0.3, 0.05, 2.5, 0.05, { tone: "line", w: 2 });
    P.line(-0.3, D + 0.03, 2.5, D + 0.03, { tone: "line", w: 4 });
    P.mono(0, D + 0.03, "M", { tone: "data", size: 12, dyPx: -10 });
    const s = m.state(t);
    if (part !== 0 && part !== 3) { /* no trail */ } else {
      const n = 40, path = Array.from({ length: n + 1 }, (_, i) => { const q = m.state((t * i) / n).b; return [q.x, q.y] as [number, number]; });
      P.poly(path, { close: false, fill: "none", tone: "idle", w: 1.2, dash: "4 4" });
    }
    P.block(s.k.x, 0, { wPx: 34, hPx: 20, base: false, label: "K" });
    P.circle(s.b.x, s.b.y, 6, { fill: "runner" });
    if (part !== 3 || t < m.events.wall) P.arrowPx(s.k.x, -0.2, s.k.vx * 200, 0, { tone: "vel", label: "v₁" });
    if (part === 1 && t >= m.events.wall - 1e-9) askWidth(P, 0, s.b.x, D, "d = ?", 20);
    if (part === 2) askLabel(P, s.k.x, 0, "v ?", 20, 30);
    if (part === 3 && t >= m.events.wall) askLabel(P, s.b.x, s.b.y, "u = ?", 16, 20);
    if (part === 4) askLabel(P, 1.5, 0, "?", 0, 40);
  },
});
