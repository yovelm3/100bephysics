import { arc, askLabel, trackMotion } from "../kits";

/**
 * 1996 q3: released with the string horizontal; at the bottom the string catches a nail C, L/2 below O, and the ball
 * goes on around C. The tension is zero where cos α = 2/3 (α from CO, upward); from there the ball flies free.
 * Drawn L = 1 m.
 */
const L = 1, al = Math.acos(2 / 3);
const path = [...arc(0, 0, L, -Math.PI / 2, 0, 300), ...arc(0, -L / 2, L / 2, 0, Math.PI - al, 400).slice(1)];
export const spec = trackMotion({
  id: "bagrut-1996-q3",
  path,
  points: { nail: 300 },
  view: { x0: -1.4, x1: 1.4, y0: -1.15, y1: 0.25 },
  bare: true,
  answers: { vEnd: [Math.sqrt(10 * L * (1 - 2 / 3)), 1e-3] },
  parts: [
    { to: (m) => m.events.end, pace: 2, caption: "החוט נתקל במסמר C, והכדור ממשיך סביבו. מה גודל המהירות כשהחוט בזווית α עם OC?" },
    { to: (m) => m.events.end, pace: 2, caption: "הראו שברגע שהמתיחות בחוט מתאפסת, cos α = 2/3." },
    { to: (m) => m.events.end, pace: 2, caption: "מה צורת המסלול של הכדור כל עוד המתיחות בחוט אפס?" },
  ],
  extra: (P, m, t, part) => {
    P.line(-0.3, 0, 0.3, 0, { tone: "line", w: 3 });
    P.circle(0, -L / 2, 4, { fill: "line" }); P.mono(0, -L / 2, "C", { tone: "data", size: 12, dxPx: -12 });
    P.mono(0, 0, "O", { tone: "data", size: 12, dyPx: -8 });
    const b = m.state(t).b, around = t >= m.events.nail - 1e-9;
    if (around) { P.line(0, 0, 0, -L / 2, { tone: "line", w: 1.4 }); P.line(0, -L / 2, b.x, b.y, { tone: "line", w: 1.4 }); P.line(0, -L / 2, 0, 0, { tone: "idle", w: 1, dash: "3 3" }); }
    else P.line(0, 0, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 7, { fill: "body" });
    if (Math.hypot(b.vx, b.vy) > 0.05) P.arrowPx(b.x, b.y, b.vx * 14, -b.vy * 14, { tone: "vel", label: "v" });
    if (around) P.mono(0.05, -L / 2 + 0.12, "α", { tone: "data", size: 12, anchor: "start" });
    if (part === 0 && around) askLabel(P, b.x, b.y, "v(α) = ?", 14, 20);
    if (part === 1 && t >= m.events.end - 1e-9) askLabel(P, b.x, b.y, "T = 0", 14, 20);
    if (part === 2 && t >= m.events.end - 1e-9) askLabel(P, b.x, b.y, "?", 14, 20);
  },
});
