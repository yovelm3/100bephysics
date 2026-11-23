import { arc, askLabel, joinSpecs, trackMotion } from "../kits";

/**
 * 1989 q3: A (0.1 kg) on a horizontal 0.8 m string swings down and hits B (0.3 kg) head-on, elastically, at the bottom
 * (4 m/s). After it B moves at 2 m/s and swings up to 41.4°. Two stories: A's swing (energy along the arc) and B's swing.
 */
const R = 0.8;
const swingA = trackMotion({
  id: "bagrut-1989-q3",
  path: arc(0, 0, R, -Math.PI / 2, 0),
  view: { x0: -1.2, x1: 1.4, y0: -1.05, y1: 0.25 },
  answers: { vEnd: [4, 0.01] },
  bare: true,
  parts: [
    { to: (m) => m.events.end, pace: 1.6, caption: "משחררים את A כשהחוט אופקי. מה המהירות שלו רגע לפני ההתנגשות?" },
    { to: (m) => m.events.end, pace: 1.6, caption: "מה המתיחות בחוט של A רגע לפני ההתנגשות?" },
  ],
  extra: (P, m, t, part) => {
    P.line(-0.3, 0, 0.3, 0, { tone: "line", w: 3 });
    const a = m.state(t).b;
    P.line(0, 0, a.x, a.y, { tone: "line", w: 1.4 });
    P.circle(a.x, a.y, 7, { fill: "body" }); P.mono(a.x, a.y, "A", { tone: "body", size: 11, dyPx: -12 });
    if (part < 2) { P.line(0.062, 0, 0.062, -R, { tone: "line", w: 1.4 }); P.circle(0.062, -R, 10, { fill: "b2" }); P.mono(0.062, -R, "B", { tone: "b2", size: 11, dyPx: -15 }); }
    if (Math.hypot(a.vx, a.vy) > 0.05) P.arrowPx(a.x, a.y, a.vx * 10, -a.vy * 10, { tone: "vel", label: "v" });
    if (part === 0 && t >= m.events.end - 1e-9) askLabel(P, a.x, a.y, "v = ?", -60, 20);
    if (part === 1 && t >= m.events.end - 1e-9) askLabel(P, 0, -R / 2, "T = ?", -50, 0);
  },
});
// part ד: without B, A swings past the bottom and comes off the string at S (drawn at 60° on the other side)
const swingS = trackMotion({
  id: "bagrut-1989-q3",
  path: arc(0, 0, R, -Math.PI / 2, Math.PI / 3),
  view: { x0: -1.2, x1: 1.4, y0: -1.05, y1: 0.25 },
  bare: true,
  parts: [{ to: (m) => m.events.end, pace: 1.6, caption: "בלי B: משחררים שוב את A, ובנקודה S הוא מתנתק מהחוט. האם הגובה המרבי אחרי זה גדול מגובה השחרור, קטן ממנו או שווה לו?" }],
  extra: (P, m, t) => {
    P.line(-0.3, 0, 0.3, 0, { tone: "line", w: 3 });
    P.line(-1.0, 0, 1.0, 0, { tone: "idle", w: 1, dash: "4 4" });
    const S: [number, number] = [R * Math.sin(Math.PI / 3), -R * Math.cos(Math.PI / 3)];
    P.circle(S[0], S[1], 3, { fill: "data" }); P.mono(S[0], S[1], "S", { tone: "data", size: 12, dxPx: 12 });
    const a = m.state(t).b;
    P.line(0, 0, a.x, a.y, { tone: "line", w: 1.4 });
    P.circle(a.x, a.y, 7, { fill: "body" }); P.mono(a.x, a.y, "A", { tone: "body", size: 11, dyPx: -12 });
    if (t >= m.events.end - 1e-9) askLabel(P, S[0], 0, "h max ?", 10, -10);
  },
});
const swingB = trackMotion({
  id: "bagrut-1989-q3",
  // up to just below the highest point (the speed is zero there)
  path: arc(0.062, 0, R, 0, 0.995 * Math.acos(0.75)),
  dt: 1e-5,
  v0: 2,
  view: { x0: -1.2, x1: 1.4, y0: -1.05, y1: 0.25 },
  bare: true,
  parts: [{ to: (m) => m.events.end, pace: 1.6, caption: "אחרי ההתנגשות B עולה. מה הזווית הגדולה ביותר של החוט שלו עם האנך?" }],
  extra: (P, m, t) => {
    P.line(-0.3, 0, 0.45, 0, { tone: "line", w: 3 });
    const b = m.state(t).b;
    P.line(0.062, 0, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 10, { fill: "b2" }); P.mono(b.x, b.y, "B", { tone: "b2", size: 11, dyPx: -15 });
    P.line(0.062, 0, 0.062, -R, { tone: "idle", w: 1, dash: "3 3" });
    P.line(0, 0, 0, -R, { tone: "line", w: 1.4 }); P.circle(0, -R, 7, { fill: "body" }); P.mono(0, -R, "A", { tone: "body", size: 11, dyPx: -12 });
    if (t >= m.events.end - 1e-9) askLabel(P, 0.062, -0.3, "θ = ?", 14, 0);
  },
});
export const spec = joinSpecs("bagrut-1989-q3", [
  { key: "A", spec: swingA, parts: [0, 1] },
  { key: "B", spec: swingB, parts: [0] },
  { key: "S", spec: swingS, parts: [0] },
], [["A", 0], ["A", 1], ["B", 0], ["S", 0]]);
