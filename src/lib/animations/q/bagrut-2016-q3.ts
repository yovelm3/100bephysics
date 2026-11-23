import { body } from "../engine";
import { arc, askLabel, joinSpecs, storySpec, trackMotion } from "../kits";

/**
 * 2016 q3: released at A (level with the center) down a smooth quarter circle ABC of radius R (drawn 1 m); B where the
 * radius makes θ with the radius to A (drawn 40°). Then a rough floor CD where it stops after 2R (μ = 0.5).
 */
const R = 1, th = (40 * Math.PI) / 180, g = 10, mu = 0.5;
const quarter = trackMotion({
  id: "bagrut-2016-q3",
  path: arc(0, R, R, -Math.PI / 2, 0, 600),
  points: { B: Math.round((600 * th) / (Math.PI / 2)) },
  dt: 2e-5,
  view: { x0: -1.3, x1: 2.4, y0: -0.25, y1: 1.6 },
  bare: true,
  answers: { "v@B": [Math.sqrt(2 * g * R * Math.sin(th)), 2e-3] },
  parts: [
    { to: (m) => m.events.B, pace: 2, caption: "הגוף משוחרר ממנוחה ב-A. מה המהירות שלו בנקודה B?" },
    { to: (m) => m.events.B, pace: 2, caption: "מה התאוצה הרדיאלית בנקודה B?" },
    { to: (m) => m.events.B, pace: 2, caption: "מה התאוצה המשיקית בנקודה B?" },
    { to: (m) => m.events.end, pace: 2, caption: "איזה גרף מתאר את האנרגיה המכנית כפונקציה של הזמן בקטע ABC?" },
  ],
  extra: (P, m, t, part) => {
    P.poly(arc(0, R, R, -Math.PI / 2, 0, 80), { close: false, fill: "none", tone: "line", w: 2.4 });
    P.line(0, 0, 2.3, 0, { tone: "line", w: 2.4 });
    P.circle(0, R, 3, { fill: "line" });
    P.mono(-R, R, "A", { tone: "data", size: 12, dxPx: -10 });
    P.mono(0, 0, "C", { tone: "data", size: 12, dyPx: 16 });
    P.mono(2 * R, 0, "D", { tone: "data", size: 12, dyPx: 16 });
    const bp: [number, number] = [-R * Math.cos(th), R - R * Math.sin(th)];
    P.mono(bp[0], bp[1], "B", { tone: "data", size: 12, dxPx: -12, dyPx: 6 });
    P.line(0, R, -R, R, { tone: "idle", w: 1, dash: "3 3" }); P.line(0, R, bp[0], bp[1], { tone: "idle", w: 1, dash: "3 3" });
    P.mono(-0.25, R - 0.08, "θ", { tone: "data", size: 11 });
    const b = m.state(t).b;
    P.circle(b.x, b.y, 7, { fill: "body" });
    const atB = t >= m.events.B - 1e-9;
    if (part === 0 && atB) askLabel(P, bp[0], bp[1], "v = ?", 16, 20);
    if (part === 1 && atB) askLabel(P, bp[0], bp[1], "aR = ?", 16, 20);
    if (part === 2 && atB) askLabel(P, bp[0], bp[1], "aT = ?", 16, 20);
    if (part === 3) askLabel(P, b.x, b.y, "E(t) ?", 16, -20);
  },
});
const floor = storySpec({
  id: "bagrut-2016-q3",
  view: { x0: -1.3, x1: 2.4, y0: -0.25, y1: 1.6 },
  scale: 2,
  story: {
    init: { b: body(0, 0, Math.sqrt(2 * g * R), 0) },
    phases: [{ end: "stop", acc: { b: [-mu * g, 0] }, dur: (s) => s.b.vx / (mu * g), force: () => ({ b: [-mu * g, 0] }), until: (s) => s.b.vx <= 0, jump: (s) => { s.b.vx = 0; } }],
    record: { CD: ["stop", (s) => s.b.x] },
  },
  order: ["stop"],
  answers: { CD: [2 * R, 1e-9] },
  parts: [
    { to: (m) => m.events.stop, pace: 2, caption: "אחרי C הגוף נעצר ב-D, ו-CD = 2R. מה מקדם החיכוך?" },
    { to: (m) => m.events.stop, pace: 2, caption: "איזה גרף מתאר את האנרגיה המכנית כפונקציה של הזמן בקטע CD?" },
  ],
  draw: (P, m, t, part) => {
    P.poly(arc(0, R, R, -Math.PI / 2, 0, 80), { close: false, fill: "none", tone: "line", w: 2.4 });
    P.line(0, 0, 2.3, 0, { tone: "line", w: 2.4 });
    P.poly([[0, 0], [2.3, 0], [2.3, -0.06], [0, -0.06]], { tone: "soft", fill: "soft" });
    P.mono(0, 0, "C", { tone: "data", size: 12, dyPx: 18 }); P.mono(2 * R, 0, "D", { tone: "data", size: 12, dyPx: 18 });
    const b = m.state(t).b;
    P.circle(b.x, 0.03, 7, { fill: "body" });
    if (b.vx > 0.05) P.arrowPx(b.x, 0.2, b.vx * 8, 0, { tone: "vel", label: "v" });
    if (part === 0 && t >= m.events.stop - 1e-9) askLabel(P, R, 0, "μ = ?", 0, -30);
    if (part === 1) askLabel(P, b.x, 0, "E(t) ?", 0, -30);
  },
});
export const spec = joinSpecs("bagrut-2016-q3", [{ key: "arc", spec: quarter, parts: [0, 1, 2, 3] }, { key: "floor", spec: floor, parts: [0, 1] }], [["arc", 0], ["arc", 1], ["arc", 2], ["floor", 0], ["arc", 3], ["floor", 1]]);
