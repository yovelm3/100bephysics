import { askLabel, graphMotion } from "../kits";

/**
 * 1991 q2: the car's speed graph (points read from the question's graph). A → B straight (0–24 s), then a curved road
 * to C (24–32 s, constant speed 17.5 m/s). The curve is drawn as an arc of 40° of the same length.
 */
const PTS: [number, number][] = [[0, 7.5], [1, 8.8], [2, 10], [2.6, 12], [3, 15], [3.4, 18.5], [4, 20], [4.6, 19.5], [6, 15.8], [8, 11], [10, 7], [11, 5.5], [12, 5], [13, 5.6], [14, 7], [15, 9.5], [16, 12], [18, 14.5], [20, 16], [22, 17], [24, 17.5], [32, 17.5]];
let L = 0;
for (let i = 0; i < 20; i++) L += ((PTS[i][1] + PTS[i + 1][1]) / 2) * (PTS[i + 1][0] - PTS[i][0]);
const arc = 17.5 * 8, ang = (40 * Math.PI) / 180, R = arc / ang;
const path: [number, number][] = [[0, 0], [L, 0]];
for (let i = 1; i <= 30; i++) { const f = (ang * i) / 30; path.push([L + R * Math.sin(f), R * (1 - Math.cos(f))]); }
// the path's straight part plus the arc, so a little longer than the motion (the polyline is a bit shorter than the arc)
path.push([path[path.length - 1][0] + 30 * Math.cos(ang), path[path.length - 1][1] + 30 * Math.sin(ang)]);
const names = PTS.map((_, i) => (i === 0 ? "A" : i === 20 ? "B" : i === 21 ? "C" : `c${i}`));
export const spec = graphMotion({
  id: "bagrut-1991-q2",
  v: PTS,
  names,
  range: [-15, L + R * Math.sin(ang) + 25],
  along: path,
  shape: "ball",
  graph: { vMin: 0, vMax: 23, yLabel: "|v| (m/s)", tTicks: [4, 8, 12, 14, 16, 20, 24, 32], vTicks: [5, 10, 15, 20] },
  answers: { "x@B": [L, 1e-6] },
  parts: [
    { to: (m) => m.events.B, pace: 0.4, hideClock: true, caption: "בקטע הישר: באילו רגעים התאוצה של המכונית אפס?", ask: (P) => askLabel(P, L / 2, 0, "a = 0 ?", 0, 40) },
    { from: () => 14, to: (m) => m.events.B, pace: 0.4, caption: "מ-14 עד 24 שניות: האם הכוח השקול על המכונית קטן, קבוע או גדל?", ask: (P) => askLabel(P, L * 0.8, 0, "ΣF ?", 0, 40) },
    { to: (m) => m.events.B, pace: 0.4, hideClock: true, caption: "בערך מתי, בקטע הישר, התאוצה הכי גדולה?", ask: (P) => askLabel(P, L / 2, 0, "a max ?", 0, 40) },
    { from: (m) => m.events.B, to: (m) => m.events.C, pace: 0.4, caption: "במסלול העקום גודל המהירות קבוע. האם התאוצה אפס?", ask: (P) => askLabel(P, L + 40, 20, "a = 0 ?", 30, 0) },
    { to: () => 14, pace: 0.4, caption: "האם הדרך מ-2 עד 6 שניות קטנה מהדרך מ-8 עד 14 שניות, גדולה ממנה או שווה לה?", ask: (P) => askLabel(P, L / 2, 0, "d₁ ? d₂", 0, 40) },
  ],
  extra: (P) => {
    P.mono(0, 0, "A", { tone: "data", size: 13, dyPx: 22 });
    P.mono(L, 0, "B", { tone: "data", size: 13, dyPx: 22 });
    const e = path[path.length - 2];
    P.mono(e[0], e[1], "C", { tone: "data", size: 13, dxPx: 14 });
  },
});
