import { askLabel, graphMotion } from "../kits";

/**
 * 1994 q2: the computer's dots of a body on a horizontal plane, every equal time (one unit drawn as 1 s): straight ABCD,
 * then an arc DEFG around O. The body moves along the dots; its speed between dots is the dot spacing, changing
 * linearly between the middles of the intervals (so it passes close to each dot). 1 px of the figure = 1 cm.
 */
const PX: [number, number][] = [[60, 340], [94, 340], [160, 340], [318, 340], [418, 340], [472, 340], [505, 340], [535, 335], [557, 328], [580, 318], [597, 303], [613, 285], [628, 265], [641, 238], [643, 208], [632, 145], [582, 90], [450, 75], [368, 228]];
const pts = PX.map(([x, y]) => [x / 100, (400 - y) / 100] as [number, number]);
const d = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
const v: [number, number][] = [[0, d[0]], ...d.map((dk, k) => [k + 0.5, dk] as [number, number]), [d.length, d[d.length - 1]]];
export const spec = graphMotion({
  id: "bagrut-1994-q2",
  panel: "none",
  v,
  range: [0, 7],
  along: pts,
  graph: { vMin: 0, vMax: 2 },
  parts: [
    { to: () => 18, pace: 0.4, caption: "הנקודות מסמנות את מקום הגוף במרווחי זמן שווים. מה כיווני המהירות והתאוצה בנקודות B, C, E ו-F?" },
    { to: () => 6, pace: 0.4, caption: "האם גודל המהירות בנקודה B שווה לגודל המהירות בנקודה C, גדול ממנו או קטן ממנו?" },
    { to: () => 6, pace: 0.4, caption: "האם גודל התאוצה בנקודה B שווה לגודל התאוצה בנקודה C, גדול ממנו או קטן ממנו?" },
  ],
  extra: (P, _m, _t, part) => {
    for (const p of pts) P.circle(p[0], p[1], 3.5, { fill: "data" });
    P.circle(5.05, 1.95, 3, { fill: "line" }); P.mono(5.05, 1.95, "O", { tone: "data", size: 11, dxPx: -10 });
    for (const [lab, x, y] of [["A", 60, 365], ["B", 160, 365], ["C", 472, 365], ["D", 505, 365], ["E", 612, 330], ["F", 600, 80], ["G", 390, 232]] as const) P.mono(x / 100, (400 - y) / 100, lab, { tone: "data", size: 12 });
    if (part === 0) for (const [x, y] of [[160, 340], [472, 340], [612, 285], [582, 90]]) askLabel(P, x / 100, (400 - y) / 100, "v, a ?", 6, -18);
    if (part === 1) { askLabel(P, 1.6, 0.6, "|v| ?", 0, -20); askLabel(P, 4.72, 0.6, "|v| ?", 0, -20); }
    if (part === 2) { askLabel(P, 1.6, 0.6, "|a| ?", 0, -20); askLabel(P, 4.72, 0.6, "|a| ?", 0, -20); }
  },
});
