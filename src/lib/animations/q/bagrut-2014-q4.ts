import { arc, askLabel, seg, trackMotion } from "../kits";

/**
 * 2014 q4: a snowy sledging track with no friction: A (12 m), the bottom B of an arc of R = 5 m (7 m), the top C of an
 * arc of R = 5 m (9.5 m, the height where Gil is weightless), the bottom D of an arc (1 m), then straight up at 53°
 * through E (8 m) to F (14 m). The arcs are joined by straight parts. 100 kg in all; Gil is 65 kg.
 */
const R = 5, t1 = (35 * Math.PI) / 180, t2 = (50 * Math.PI) / 180, t3 = (53 * Math.PI) / 180;
const xb = 5;
const arcB = arc(xb, 12, R, -Math.PI / 2, t1, 300);
const pB1 = arcB[arcB.length - 1];
const yC0 = 4.5 + R * Math.cos(t1), run1 = (yC0 - pB1[1]) / Math.tan(t1);
const xc = pB1[0] + run1 + R * Math.sin(t1);
const arcC = arc(xc, 4.5, R, Math.PI + t1, Math.PI - t2, 300);
const pC1 = arcC[arcC.length - 1];
const yD0 = 6 - R * Math.cos(t2), run2 = (pC1[1] - yD0) / Math.tan(t2);
const xd = pC1[0] + run2 + R * Math.sin(t2);
const arcD = arc(xd, 6, R, -t2, t3, 300);
const pD1 = arcD[arcD.length - 1];
const up = (y: number): [number, number] => [pD1[0] + (y - pD1[1]) / Math.tan(t3), y];
const path: [number, number][] = [...arcB, ...seg(pB1, arcC[0], 20), ...arcC.slice(1), ...seg(pC1, arcD[0], 30), ...arcD.slice(1), ...seg(pD1, up(8), 60), ...seg(up(8), up(11.5), 30)];
const iC = 300 + 20 + Math.round((300 * t1) / (t1 + t2)), iD = 300 + 20 + 300 + 30 + Math.round((300 * t2) / (t2 + t3)), iE = 300 + 20 + 300 + 30 + 300 + 60;
export const spec = trackMotion({
  id: "bagrut-2014-q4",
  path: [[xb - R, 12.0001], ...path.slice(1)],
  points: { B: Math.round((300 * (Math.PI / 2)) / (Math.PI / 2 + t1)), C: iC, D: iD, E: iE },
  dt: 1e-4,
  view: { x0: -1, x1: 37, y0: -0.5, y1: 15 },
  bare: true,
  answers: { "v@B": [10, 2e-3], "v@C": [Math.sqrt(50), 2e-3], "v@E": [Math.sqrt(80), 2e-3] },
  parts: [
    { to: (m) => m.events.B, pace: 0.6, caption: "משחררים את המזחלת ממנוחה ב-A. מה המהירות שלה ב-B?" },
    { to: (m) => m.events.B, pace: 0.6, caption: "האם התשובה הייתה משתנה עם נער במסה אחרת?" },
    { to: (m) => m.events.C, pace: 0.6, caption: "באיזה גובה צריכה להיות C, כדי שגיל יהיה חסר משקל כשהוא עובר בה?" },
    { to: (m) => m.events.E, pace: 0.6, caption: "מה מראים המאזניים, בניוטון, כשהמזחלת עוברת ב-E?" },
    { to: (m) => m.events.E, pace: 0.6, caption: "השלג נמס בקטע DF, והמזחלת נעצרת לרגע ב-E. מה כוח החיכוך בקטע DE?" },
  ],
  extra: (P, m, t, part) => {
    P.ground(0, -0.8, 36.8);
    P.poly(path, { close: false, fill: "none", tone: "line", w: 2.4 });
    P.line(...up(11.5), ...up(14), { tone: "line", w: 2.4 });
    const lab = (l: string, p: [number, number], dy = -12) => P.mono(p[0], p[1], l, { tone: "data", size: 12, dyPx: dy });
    lab("A", [xb - R, 12]); lab("B", [xb, 7], 18); lab("C", [xc, 9.5]); lab("D", [xd, 1], 18); lab("E", up(8)); lab("F", up(14));
    const b = m.state(t).b;
    P.block(b.x, b.y + 0.3, { wPx: 26, hPx: 12, base: false });
    if (part === 4 && b.y > 1.2 && b.x > xd) P.poly([[...up(1.1)] as [number, number], up(8)], { close: false, fill: "none", tone: "soft", w: 6 });
    const at = (k: string) => t >= m.events[k] - 1e-9;
    if (part === 0 && at("B")) askLabel(P, b.x, b.y, "v = ?", 16, 26);
    if (part === 1) askLabel(P, b.x, b.y, "m ?", 16, -24);
    if (part === 2 && at("C")) askLabel(P, xc, 9.5, "h = ?", 16, -24);
    if (part === 3 && at("E")) askLabel(P, b.x, b.y, "N = ?", -60, 0);
    if (part === 4 && at("E")) askLabel(P, b.x, b.y, "f = ?", -60, 0);
  },
});
