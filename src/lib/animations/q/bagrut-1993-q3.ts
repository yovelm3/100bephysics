import type { AnimSpec } from "../engine";
import { arc, askLabel, askSpan, collision, joinSpecs, trackMotion } from "../kits";

/**
 * 1993 q3: a 20 g bullet at 500 m/s sticks in a 9.98 kg block hanging on a 2 m string: 1 m/s together; then the block
 * swings up 5 cm. Two stories: the very short hit (a plastic collision, seen up close) and the swing (energy along the arc).
 */
const L = 2, h = 0.05;
const hit = collision({
  id: "bagrut-1993-q3",
  a: { m: 0.02, x: -0.5, v: 500, w: 0.02 },
  b: { m: 9.98, x: 0, v: 0, w: 0.2 },
  kind: "plastic",
  k: 2e6,
  tEnd: 0.0016,
  answers: { vb: [1, 1e-9] },
  view: { x0: -0.6, x1: 0.3, y0: -0.25, y1: 0.2 },
  parts: [{ to: (m) => m.events.end, pace: 2000, caption: "הקליע נתקע בגוש. האם האנרגיה המכנית נשמרת בהתנגשות?" }],
  draw: (P, m, t) => {
    const s = m.state(t);
    P.line(0, 0.2, s.b.x, 0.1, { tone: "line", w: 1.4 });
    P.block(s.b.x, 0, { wPx: 60, hPx: 60, base: false, tone: "b2" });
    if (t < m.events.stick) P.block(s.a.x, 0, { wPx: 14, hPx: 5, base: false, tone: "line" });
    P.arrowPx(s.a.x - 0.05, 0.08, Math.min(80, s.a.vx * 0.2), 0, { tone: "vel", label: "v" });
    askLabel(P, 0.15, 0.1, "E = const ?", 0, -10);
  },
});
const th = Math.acos(1 - h / L);
const swing = trackMotion({
  id: "bagrut-1993-q3",
  path: arc(0, L, L, 0, 0.995 * th, 400),
  v0: 1,
  dt: 1e-4,
  view: { x0: -0.9, x1: 0.9, y0: -0.12, y1: 0.78 },
  bare: true,
  parts: [
    { to: (m) => m.events.end, pace: 1.5, caption: "הגוש עם הקליע מתנדנד. לאיזה גובה מרבי הוא מתרומם?" },
    { to: (m) => m.events.end, pace: 1.5, caption: "מה העבודה של המתיחות בחוט, עד הגובה המרבי?" },
    { to: (m) => m.events.end, pace: 1.5, hideClock: true, caption: "כמה זמן לוקח לגוש להגיע לגובה המרבי?" },
  ],
  extra: (P, m, t, part) => {
    const b = m.state(t).b;
    // the string goes up out of the picture (2 m); its direction toward the pivot
    const dx = -b.x, dy = L - b.y, n = Math.hypot(dx, dy);
    P.line(b.x, b.y, b.x + (dx / n) * 0.8, b.y + (dy / n) * 0.8, { tone: "line", w: 1.4 });
    P.block(b.x, b.y, { wPx: 40, hPx: 40, base: false, tone: "b2" });
    P.line(-0.8, 0, 0.8, 0, { tone: "idle", w: 1, dash: "4 4" });
    if (part === 0 && t >= m.events.end - 1e-9) askSpan(P, b.x + 0.15, 0, b.y, "h = ?", 0);
    if (part === 1) askLabel(P, b.x / 2, 0.5, "W(T) = ?", 0, 0);
    if (part === 2 && t >= m.events.end - 1e-9) askLabel(P, b.x, b.y, "t = ?", 30, -10);
  },
});
export const spec: AnimSpec = joinSpecs("bagrut-1993-q3", [{ key: "hit", spec: hit, parts: [0] }, { key: "swing", spec: swing, parts: [0, 1, 2] }]);
