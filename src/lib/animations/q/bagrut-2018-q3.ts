import { arc, askLabel, trackMotion } from "../kits";

/**
 * 2018 q3: a ski run: AC an arc over a hill and CG an arc through a dip, both of R = 60 m; E, the lowest point, is
 * 32 m high; the skier starts from rest at A (60 m high, so 23.66 m/s at E). Drawn: A at 15° from the hill's top,
 * C at 41.4°, so that the heights match. No friction until G.
 */
const R = 60, hE = 32, hA = 60, a = (15 * Math.PI) / 180;
const yO1 = hA - R * Math.cos(a);
const c = Math.acos((hE - yO1 + R) / (2 * R));
const O2: [number, number] = [2 * R * Math.sin(c), yO1 + 2 * R * Math.cos(c)];
const hill = arc(0, yO1, R, Math.PI - a, Math.PI - c, 300);
const dip = arc(O2[0], O2[1], R, -c, c, 400).slice(1);
export const spec = trackMotion({
  id: "bagrut-2018-q3",
  path: [...hill, ...dip],
  points: { B: 150, C: 300, D: 400, E: 500 },
  dt: 1e-3,
  view: { x0: 0, x1: 150, y0: 20, y1: 66 },
  bare: true,
  answers: { "v@E": [23.664319132398465, 2e-3] },
  parts: [
    { to: (m) => m.events.B, pace: 0.6, caption: "איזה איור מציג נכון את הכוחות על הגולש בנקודה B?" },
    { to: (m) => m.events.D, pace: 0.6, caption: "האם לתאוצה בנקודה D יש רכיב משיקי?" },
    { to: (m) => m.events.D, pace: 0.6, caption: "מה הכיוון של התאוצה הכוללת בנקודה D?" },
    { to: (m) => m.events.E, pace: 0.6, caption: "R = 60 m, m = 80 kg, E בגובה 32 m. מה המהירות בנקודה E?" },
    { to: (m) => m.events.E, pace: 0.6, caption: "מה הכוח שהגולש מפעיל על המסלול בנקודה E?" },
    { to: (m) => m.events.end, pace: 0.6, caption: "אחרי G יש חיכוך, והעבודה שלו 20 kJ. האם הגולש מגיע ל-L, בגובה 36 m?" },
  ],
  extra: (P, m, t, part) => {
    P.poly([...hill, ...dip], { close: false, fill: "none", tone: "line", w: 2.4 });
    const lab = (n: string, i: number, dy = -12) => { const p = [...hill, ...dip][i]; P.mono(p[0], p[1], n, { tone: "data", size: 12, dyPx: dy }); };
    lab("A", 0); lab("B", 150); lab("C", 300); lab("D", 400, 18); lab("E", 500, 18); lab("G", 699);
    const b = m.state(t).b;
    P.person(b.x, b.y, 0, { tone: "runner" });
    const at = (k: string) => t >= m.events[k] - 1e-9;
    if (part === 0 && at("B")) askLabel(P, b.x, b.y, "?", 16, -40);
    if (part === 1 && at("D")) askLabel(P, b.x, b.y, "aT ?", 16, -40);
    if (part === 2 && at("D")) askLabel(P, b.x, b.y, "a ?", 16, -40);
    if (part === 3 && at("E")) askLabel(P, b.x, b.y, "v = ?", 16, -40);
    if (part === 4 && at("E")) askLabel(P, b.x, b.y, "F = ?", 16, 20);
    if (part === 5 && at("end")) askLabel(P, b.x, b.y, "L ?", 16, -40);
  },
});
