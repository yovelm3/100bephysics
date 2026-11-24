import { body } from "../engine";
import { askLabel, askSpan, storySpec } from "../kits";

/**
 * 1990 q2: a 2 kg cart on a smooth 30° slope, tied over a pulley at the top to m = 1 kg; they move at a constant 1 m/s
 * (the cart down). At t = 1 s the string breaks: the cart speeds up at 5 m/s², m flies up and falls. A 2 kg lump is let
 * go from A at 0.8 s and lands on the cart, and sticks, 0.5 s after the break, as the cart passes under A.
 * The cart's speed along the slope does not change (the lump's momentum along the slope makes up for its mass).
 */
const g = 10, th = Math.PI / 6, c = Math.cos(th), sn = Math.sin(th), M = 2, mL = 2;
const s0 = 0.6;
const sHit = s0 + 1 + 0.5 + 0.5 * 5 * 0.25;
const A: [number, number] = [sHit * c, -sHit * sn + 2.45];
const down = (a: number): [number, number] => [a * c, -a * sn];
export const spec = storySpec({
  id: "bagrut-1990-q2",
  view: { x0: -0.6, x1: 4.6, y0: -2.6, y1: 1.6 },
  scale: 4,
  story: {
    init: { c: body(s0 * c, -s0 * sn, c, -sn), w: body(-0.25, -1.2, 0, 1), p: body(A[0], A[1], 0, 0) },
    phases: [
      { end: "drop", acc: {}, dur: () => 0.8, force: () => ({}), until: (_s, t) => t >= 0.8 - 1e-12 },
      { end: "break", acc: { p: [0, -g] }, dur: () => 0.2, force: () => ({ p: [0, -g] }), until: (_s, t) => t >= 1 - 1e-12 },
      // build 2: after the break, the cart has only the part of its weight along the slope; m and the lump fall freely
      { end: "hit", acc: { c: down(g * sn), w: [0, -g], p: [0, -g] }, dur: () => 0.5, force: () => ({ c: down((M * g * sn) / M), w: [0, -g], p: [0, -g] }), until: (s) => s.p.y <= s.c.y,
        jump: (s) => { const V = Math.hypot(s.c.vx, s.c.vy), u = -s.p.vy; const V2 = (M * V + mL * u * sn) / (M + mL); s.c.vx = V2 * c; s.c.vy = -V2 * sn; s.p.vx = s.c.vx; s.p.vy = s.c.vy; s.p.y = s.c.y; s.p.x = s.c.x; } },
      { end: "end", acc: { c: down(g * sn), w: [0, -g], p: down(g * sn) }, dur: () => 0.25, force: () => ({ c: down(g * sn), w: [0, -g], p: down(g * sn) }), until: (_s, t) => t >= 1.75 - 1e-12 },
    ],
    record: { h: ["drop", (s) => s.p.y] },
  },
  order: ["drop", "break", "hit", "end"],
  answers: { hit: [1.5, 1e-9] },
  parts: [
    { to: () => 1, pace: 1.2, caption: "הקרונית יורדת והמשקולת עולה, במהירות קבועה. מה המסה m של המשקולת?" },
    { from: () => 0.9, to: () => 1.45, pace: 1.6, caption: "ברגע מסוים החוט נקרע. איך נעות הקרונית והמשקולת מעכשיו?" },
    { to: (m) => m.events.end, pace: 1.2, caption: "גוש פלסטלינה משוחרר ממנוחה מ-A ונדבק לקרונית חצי שנייה אחרי שהחוט נקרע. מה הגובה של A מעל נקודת הפגיעה?" },
  ],
  draw: (P, m, t, part) => {
    const L = 4.6;
    P.poly([[0, 0], [L * c, -L * sn], [0, -L * sn]]);
    P.pulley(-0.1, 0.12, 10);
    const s = m.state(t), broken = t >= 1 - 1e-9, stuck = t >= m.events.hit - 1e-9;
    P.block(s.c.x, s.c.y, { wPx: 32, hPx: 20, angle: -th, label: "M" });
    if (!broken) { P.line(s.c.x - 0.1, s.c.y + 0.12, -0.05, 0.2, { tone: "line", w: 1.3 }); P.line(-0.25, 0.12, -0.25, s.w.y + 0.12, { tone: "line", w: 1.3 }); }
    P.block(-0.25, s.w.y, { wPx: 20, hPx: 22, base: false, label: "m", tone: "b2" });
    if (part === 2) {
      P.circle(A[0], A[1], 3, { fill: "data" }); P.mono(A[0], A[1], "A", { tone: "data", size: 12, dxPx: 12 });
      P.circle(s.p.x, s.p.y + (stuck ? 0.18 : 0.06), 7, { fill: "runner" });
      if (stuck) askSpan(P, A[0] + 0.35, A[1], s.c.y + 0.1, "h = ?", 0);
    }
    if (part === 0) askLabel(P, -0.25, s.w.y, "m = ?", 22, 0);
    if (part === 1 && broken) { askLabel(P, s.c.x, s.c.y, "?", 20, -30); askLabel(P, -0.25, s.w.y, "?", 22, 0); }
  },
});
