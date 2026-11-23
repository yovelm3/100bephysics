import { arc, askLabel, seg, trackMotion } from "../kits";

/** 2000 q4: from rest at A (20 m), straight BC, an arc CDE of R = 5 m with its bottom D, straight EF. Slopes drawn at 40°. */
const h = 20, R = 5, th = (40 * Math.PI) / 180;
const cx = 30, Cp: [number, number] = [cx - R * Math.sin(th), R - R * Math.cos(th)];
const A: [number, number] = [Cp[0] - (h - Cp[1]) / Math.tan(th), h];
const Ep: [number, number] = [cx + R * Math.sin(th), Cp[1]];
const F: [number, number] = [Ep[0] + 12 * Math.cos(th), Ep[1] + 12 * Math.sin(th)];
const path: [number, number][] = [A, ...seg(A, Cp, 80), ...arc(cx, R, R, -th, th, 200).slice(1), ...seg(Ep, F, 40)];
export const spec = trackMotion({
  id: "bagrut-2000-q4",
  path,
  points: { D: 80 + 100 },
  view: { x0: -2, x1: 50, y0: -2, y1: 24 },
  answers: { "v@D": [20, 1e-3] },
  parts: [
    { to: (m) => m.events.end, pace: 0.8, caption: "מה הכיוונים של המהירות, של התאוצה ושל הכוח השקול: בין B ל-C, בנקודה D, ובין E ל-F?" },
    { to: (m) => m.events.D, pace: 0.8, caption: "מה מראים המאזניים, ביחס ל-mg, כשהקרונית עוברת ב-D?" },
    { to: (m) => m.events.D, pace: 0.8, caption: "ב-D: לאן נוטה הדם בגוף של התלמיד להצטבר?" },
  ],
  extra: (P, m, t, part) => {
    P.ground(0, -2, 49);
    P.mono(A[0], A[1], "A", { tone: "data", size: 12, dyPx: -12 });
    P.mono(cx, 0, "D", { tone: "data", size: 12, dyPx: 16 });
    P.dim(A[0] - 1.5, 0, A[0] - 1.5, h, "20 m", { offPx: 0 });
    const b = m.state(t).b;
    if (part === 0) askLabel(P, b.x, b.y, "v, a, ΣF ?", 14, -24);
    if (part === 1 && t >= m.events.D - 1e-9) askLabel(P, cx, 0, "N = ? mg", 20, -30);
    if (part === 2 && t >= m.events.D - 1e-9) askLabel(P, cx, 0, "?", 20, -30);
  },
});
