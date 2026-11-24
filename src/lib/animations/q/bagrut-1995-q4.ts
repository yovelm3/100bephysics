import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/** 1995 q4 (from above): two particles from O at the same speed; 1 hits the wall square on, 2 at α to the wall (drawn 40°). Elastic, no friction with the wall. */
const v = 2, X = 3, al = (40 * Math.PI) / 180;
export const spec = storySpec({
  id: "bagrut-1995-q4",
  view: { x0: -0.5, x1: 3.6, y0: -0.4, y1: 4.7 },
  scale: 4,
  story: {
    init: { p1: body(0, 0.6, v, 0), p2: body(0, 0.6, v * Math.sin(al), v * Math.cos(al)) },
    phases: [
      { end: "hit1", acc: {}, dur: () => X / v, force: () => ({}), until: (s) => s.p1.x >= X, jump: (s) => { s.p1.vx = -s.p1.vx; } },
      { end: "hit2", acc: {}, dur: (_s, t0) => X / (v * Math.sin(al)) - t0, force: () => ({}), until: (s) => s.p2.x >= X, jump: (s) => { s.p2.vx = -s.p2.vx; } },
      { end: "end", acc: {}, dur: () => 0.35, force: () => ({}), until: (_s, t, t0) => t - t0 >= 0.35 - 1e-12 },
    ],
    record: { u2: ["hit2", (s) => Math.hypot(s.p2.vx, s.p2.vy)], u1: ["hit1", (s) => s.p1.vx] },
  },
  order: ["hit1", "hit2", "end"],
  answers: { u1: [-2, 1e-9], u2: [2, 1e-9] },
  parts: [
    { to: (m) => m.events.hit1 + 0.8, pace: 1, caption: "חלקיק 1 פוגע בקיר בניצב. מה המהירות שלו אחרי הפגיעה?" },
    { to: (m) => m.events.hit1 + 0.8, pace: 1, caption: "מה השינוי בתנע של חלקיק 1?" },
    { to: (m) => m.events.end, pace: 1, caption: "חלקיק 2 פוגע בקיר בזווית α. מה גודל המהירות שלו אחרי הפגיעה?" },
    { to: (m) => m.events.end, pace: 1, caption: "הוכיחו שהזווית שבה הוא מתרחק מהקיר שווה לזווית α." },
    { to: (m) => m.events.end, pace: 1, caption: "מה המתקף שהקיר הפעיל על חלקיק 2?" },
  ],
  draw: (P, m, t, part) => {
    P.wall(X + 0.08, -0.3, 4.6, "right");
    P.circle(0, 0.6, 3, { fill: "data" }); P.mono(0, 0.6, "O", { tone: "data", size: 12, dxPx: -12 });
    const s = m.state(t);
    const key = part < 2 ? "p1" : "p2";
    const b = s[key];
    const path = Array.from({ length: 61 }, (_, i) => { const q = m.state((t * i) / 60)[key]; return [q.x, q.y] as [number, number]; });
    P.poly(path, { close: false, fill: "none", tone: "idle", w: 1.2, dash: "4 4" });
    P.circle(b.x, b.y, 7, { fill: part < 2 ? "body" : "b2" });
    P.arrowPx(b.x, b.y, b.vx * 20, -b.vy * 20, { tone: "vel", label: "v" });
    const after = t >= m.events[part < 2 ? "hit1" : "hit2"] - 1e-9;
    if (part === 0 && after) askLabel(P, b.x, b.y, "u = ?", -20, -20);
    if (part === 1 && after) askLabel(P, b.x, b.y, "Δp = ?", -20, -20);
    if (part === 2 && after) askLabel(P, b.x, b.y, "|u| = ?", -30, -20);
    if (part === 3) { P.mono(X - 0.15, m.state(m.events.hit2).p2.y - 0.4, "α", { tone: "data", size: 12 }); if (after) askLabel(P, b.x, b.y, "β = α ?", -30, -20); }
    if (part === 4 && after) askLabel(P, X, m.state(m.events.hit2).p2.y, "J = ?", -40, 0);
  },
});
