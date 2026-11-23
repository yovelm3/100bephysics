import { body } from "../engine";
import { askLabel, askSpan, fallPhase, storySpec } from "../kits";

/** 2017 q1: a penalty kicked from 11 m at 11.5 m/s, 55° above the ground; the goal is 2.44 m high. */
const g = 10, d = 11, h = 2.44;
const a = (55 * Math.PI) / 180, v0 = 11.5;
const vx = v0 * Math.cos(a), vy = v0 * Math.sin(a);
export const spec = storySpec({
  id: "bagrut-2017-q1",
  view: { x0: -1.2, x1: 14.5, y0: -0.6, y1: 6.4 },
  scale: 12,
  story: {
    init: { b: body(0, 0, vx, vy) },
    phases: [
      { end: "top", acc: { b: [0, -g] }, dur: (s) => s.b.vy / g, force: () => ({ b: [0, -g] }), until: (s) => s.b.vy <= 0 },
      { end: "goalLine", acc: { b: [0, -g] }, dur: (s) => (d - s.b.x) / s.b.vx, force: () => ({ b: [0, -g] }), until: (s) => s.b.x >= d },
      fallPhase({ end: "land", body: "b", toY: 0 }),
    ],
    record: { yGoal: ["goalLine", (s) => s.b.y] },
  },
  order: ["top", "goalLine", "land"],
  answers: { yGoal: [vy * (d / vx) - 5 * (d / vx) ** 2, 1e-9] },
  parts: [
    { to: (m) => m.events.land, pace: 1.6, caption: "הכדור נע במסלול של פרבולה. איך משתנה הרכיב האנכי של המהירות שלו עם הזמן?" },
    { to: (m) => m.events.land, pace: 1.6, caption: "Q גבוהה מ-P. האם הרכיב האופקי של המהירות בנקודה P קטן מזה שבנקודה Q, גדול ממנו או שווה לו?" },
    { to: (m) => m.events.land, pace: 1.6, caption: "האם התאוצה של הכדור בנקודה P קטנה מזו שבנקודה Q, גדולה ממנה או שווה לה?" },
    { to: (m) => m.events.goalLine, pace: 1.6, caption: "d = 11 m, v₀ = 11.5 m/s, α = 55°, גובה השער 2.44 m. האם הכדור נכנס לשער?" },
    { to: (m) => m.events.goalLine, pace: 1.6, caption: "שחקן אחר בועט מאותו מקום ובאותה זווית, אבל מהר יותר. האם הכדור נכנס בוודאות לשער?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -1, 14.3);
    // the goal: a post and the crossbar at the goal line, the net behind it
    P.line(d, 0, d, h, { tone: "line", w: 4 });
    P.line(d, h, d + 1.8, h * 0.8, { tone: "soft", w: 1.4 });
    P.line(d + 1.8, h * 0.8, d + 1.8, 0, { tone: "soft", w: 1.4 });
    P.mono(0, 0, "d", { tone: "data", size: 12, dyPx: 18, dxPx: 0 });
    const s = m.state(t).b;
    const T = m.events.land;
    const path = Array.from({ length: 61 }, (_, i) => { const q = m.state((T * i) / 60).b; return [q.x, q.y] as [number, number]; });
    if (part === 1 || part === 2) {
      P.poly(path, { close: false, fill: "none", tone: "soft", w: 1.6, dash: "5 4" });
      const tP = 0.2 * 2 * (vy / g), tQ = vy / g;
      const p = m.state(tP).b, q = m.state(tQ).b;
      P.circle(p.x, p.y, 4, { fill: "data" }); P.mono(p.x, p.y, "P", { tone: "data", size: 13, dxPx: -12, dyPx: -6 });
      P.circle(q.x, q.y, 4, { fill: "data" }); P.mono(q.x, q.y, "Q", { tone: "data", size: 13, dyPx: -12 });
      if (part === 1) { askLabel(P, p.x, p.y, "vₓ ?", 10, 26); askLabel(P, q.x, q.y, "vₓ ?", 10, -30); }
      else { askLabel(P, p.x, p.y, "a ?", 10, 26); askLabel(P, q.x, q.y, "a ?", 10, -30); }
    }
    P.ball(s.x, s.y, { rPx: 7 });
    if (part === 0) { P.arrowPx(s.x, s.y + 0.2, 0, -s.vy * 4, { tone: "vel", label: "vᵧ" }); askLabel(P, s.x, s.y, "vᵧ(t) ?", 20, -20); }
    else if (part >= 3) P.arrowPx(s.x, s.y + 0.2, s.vx * 4, -s.vy * 4, { tone: "vel", label: "v" });
    if (part === 3) { P.dim(d + 2.6, 0, d + 2.6, h, "2.44 m", { offPx: 0 }); if (t >= m.events.goalLine - 1e-9) askSpan(P, d - 0.4, 0, s.y, "y = ?", 0); }
    if (part === 4) askLabel(P, 0, 0, "v > v₀ ?", 30, -60);
  },
});
