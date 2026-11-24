import { arc, askLabel, trackMotion } from "../kits";

/** 1988 q4: a bead on a smooth vertical hoop of radius R (drawn 30 cm), let go at A (drawn 60° from the bottom). */
const R = 0.3, a0 = Math.PI / 3;
export const spec = trackMotion({
  id: "bagrut-1988-q4",
  path: arc(0, R, R, -a0, 0.99 * a0, 600),
  points: { low: 300 },
  dt: 1e-5,
  view: { x0: -0.5, x1: 0.5, y0: -0.05, y1: 0.67 },
  bare: true,
  parts: [
    { to: (m) => m.events.end, pace: 2, caption: "בזווית גדולה: איזו תנועה יש לחרוז?" },
    { to: (m) => m.events.end, pace: 2, hideClock: true, caption: "בזווית קטנה: כמה זמן לוקחת תנודה שלמה?" },
    { to: (m) => m.events.low, pace: 2, caption: "מסובבים את החישוק סביב הציר האנכי, והחרוז עולה ל-A. מה המהירות הזוויתית?" },
  ],
  extra: (P, m, t, part) => {
    P.ring(0, R, R, { tone: "line", w: 2.4 });
    P.line(0, -0.03, 0, 2 * R + 0.03, { tone: "idle", w: 1, dash: "3 3" });
    P.mono(0, 0, "C", { tone: "data", size: 11, dyPx: 14 }); P.mono(0, 2 * R, "B", { tone: "data", size: 11, dyPx: -6 });
    const A: [number, number] = [-R * Math.sin(a0), R - R * Math.cos(a0)];
    P.mono(A[0], A[1], "A", { tone: "data", size: 11, dxPx: -10 });
    const b = m.state(t).b;
    P.circle(b.x, b.y, 6, { fill: "body" });
    askLabel(P, 0.38, 0.55, ["?", "T = ?", "ω = ?"][part], 0, 0);
  },
});
