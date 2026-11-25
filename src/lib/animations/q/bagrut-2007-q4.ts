import { arc, askLabel, joinSpecs, seg, trackMotion } from "../kits";

/**
 * 2007 q4: 0.2 kg released at A, 1.2 m above C, the bottom of a loop of r = 0.4 m (C bottom, D and F ends of the
 * horizontal diameter, E the top). Part ה: released at B, 0.9 m above C: it comes off before E, so that window ends at D.
 */
const r = 0.4, th = (35 * Math.PI) / 180;
const start = (h: number): [number, number][] => {
  const A: [number, number] = [-h / Math.tan(th), h];
  return [A, ...seg(A, [0, 0], 120)];
};
const loop = arc(0, r, r, 0, 2 * Math.PI, 800).slice(1);
const draw0 = (P: Parameters<NonNullable<Parameters<typeof trackMotion>[0]["extra"]>>[0]) => {
  P.ground(0, -2.0, 1.2);
  P.line(-1.2 / Math.tan(th), 1.2, 0, 0, { tone: "line", w: 2.4 });
  P.ring(0, r, r, { tone: "line", w: 2.4 });
  P.line(0, 0, 1.1, 0, { tone: "line", w: 2.4 });
  for (const [lab, x, y] of [["C", 0, 0], ["D", r, r], ["E", 0, 2 * r], ["F", -r, r]] as const) P.mono(x * 1.25, y === 0 ? 0 : (y - r) * 1.25 + r, lab, { tone: "data", size: 12, dyPx: y === 0 ? 16 : 4 });
};
const main = trackMotion({
  id: "bagrut-2007-q4",
  path: [...start(1.2), ...loop],
  points: { C: 120, D: 320, E: 520, F: 720 },
  view: { x0: -2.1, x1: 1.3, y0: -0.25, y1: 1.45 },
  bare: true,
  answers: { "v@E": [Math.sqrt(8), 1e-3], "v@F": [4, 1e-3] },
  parts: [
    { to: (m) => m.events.E, pace: 1.5, caption: "הגוף משוחרר ממנוחה ב-A, 1.2 m מעל C. מה הכוח שהמסילה מפעילה עליו בנקודה E, בגודל ובכיוון?",
      holds: (m) => [{ at: m.events.C, label: "נכנס ללולאה", where: [0, 0] }, { at: m.events.E, label: "הנקודה הגבוהה בלולאה", where: [0, 2 * r] }] },
    { to: (m) => m.events.F, pace: 1.5, caption: "למה האנרגיה המכנית נשמרת? שימו לב לכיוון של הכוח הנורמלי ביחס לכיוון התנועה.",
      holds: (m) => [{ at: m.events.D, label: "הכוח הנורמלי ניצב לתנועה", where: [r, r] }] },
    { from: (m) => m.events.C, to: (m) => m.events.E, pace: 2, caption: "למה המהירות קטנה בזמן שהגוף עולה מ-C ל-E? הסתכלו על כוח הכובד ביחס לכיוון התנועה.",
      holds: (m) => [{ at: m.events.D, label: "כוח הכובד נגד התנועה", where: [r, r] }] },
    { to: (m) => m.events.F, pace: 1.5, caption: "מה הכוח שהגוף מפעיל על המסילה בנקודה F, בקצה הקוטר האופקי?",
      holds: (m) => [{ at: m.events.F, label: "הגוף בנקודה F", where: [-r, r] }] },
  ],
  extra: (P, m, t, part) => {
    draw0(P);
    P.mono(-1.2 / Math.tan(th), 1.2, "A", { tone: "data", size: 12, dyPx: -10 });
    const b = m.state(t).b;
    // data where it acts: the height of A above C, the loop's radius, the mass
    if (part === 0 || part === 3) { P.dim(-1.95, 0, -1.95, 1.2, "1.2 m", { offPx: 0 }); P.mono(0, r, "r = 0.4 m", { tone: "data", size: 11, dyPx: 4 }); }
    if (t < 0.3) P.mono(b.x, b.y, "0.2 kg", { tone: "data", size: 11, dyPx: -14 });
    P.circle(b.x, b.y, 7, { fill: "body" });
    if (Math.hypot(b.vx, b.vy) > 0.05) P.arrowPx(b.x, b.y, b.vx * 9, -b.vy * 9, { tone: "vel", label: "v" });
    const inLoop = t >= m.events.C;
    const toC = inLoop ? [(0 - b.x), (r - b.y)] : [0, 1];
    const n = Math.hypot(toC[0], toC[1]) || 1;
    if (part === 1 && inLoop) P.arrowPx(b.x, b.y, (toC[0] / n) * 34, (-toC[1] / n) * 34, { tone: "force", label: "N" });
    if (part === 2) {
      P.arrowPx(b.x, b.y, 0, 34, { tone: "force", label: "mg" });
      // the part of the weight along the motion (against it on the way up)
      const v = Math.hypot(b.vx, b.vy) || 1, comp = -10 * (b.vy / v);
      P.arrowPx(b.x, b.y, (b.vx / v) * comp * 3, (-b.vy / v) * comp * 3, { tone: "ask", w: 2 });
      askLabel(P, b.x, b.y, "v ↓ ?", 16, -14);
    }
    if (part === 0 && t >= m.events.E - 1e-9) { P.arrowPx(0, 2 * r, 0, 30, { tone: "force", label: "mg" }); P.arrowPx(0.06, 2 * r, 0, 30, { tone: "ask", label: "N ?" }); askLabel(P, 0, 2 * r, "N = ?", 30, -24); }
    if (part === 1) askLabel(P, 0.8, 1.1, "E = const ?", 0, 0);
    if (part === 3 && t >= m.events.F - 1e-9) { P.arrowPx(-r, r, 34, 0, { tone: "ask", label: "?" }); askLabel(P, -r, r, "F = ?", -60, 0); }
  },
});
const fromB = trackMotion({
  id: "bagrut-2007-q4",
  path: [...start(0.9), ...loop.slice(0, 200)],
  view: { x0: -2.1, x1: 1.3, y0: -0.25, y1: 1.45 },
  bare: true,
  parts: [{ to: (m) => m.events.end, pace: 1.5, caption: "הפעם הגוף משוחרר מ-B, 0.9 m מעל C. האם הוא מגיע לנקודה E?",
    holds: (m) => [{ at: m.events.end, label: "מה קורה לגוף כאן?", secs: 1.8 }] }],
  extra: (P, m, t) => {
    draw0(P);
    P.mono(-0.9 / Math.tan(th), 0.9, "B", { tone: "data", size: 12, dyPx: -10 });
    P.dim(-1.75, 0, -1.75, 0.9, "0.9 m", { offPx: 0 });
    const b = m.state(t).b;
    P.circle(b.x, b.y, 7, { fill: "body" });
    if (t >= m.events.end - 1e-9) askLabel(P, 0, 2 * r, "E ?", 16, -14);
  },
});
export const spec = joinSpecs("bagrut-2007-q4", [{ key: "A", spec: main, parts: [0, 1, 2, 3] }, { key: "B", spec: fromB, parts: [0] }]);
