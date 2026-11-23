import { arc, askLabel, trackMotion } from "../kits";

/** 2015 q4: a pendulum pulled to point 1, h above the lowest point 3, and let go (drawn L = 1 m, h = 0.3 m). Points 1–5 along the swing. */
const L = 1, h = 0.3, a0 = Math.acos(1 - h / L);
export const spec = trackMotion({
  id: "bagrut-2015-q4",
  path: arc(0, 0, L, -a0, 0.99 * a0, 600),
  points: { p2: 150, p3: 300, p4: 450 },
  dt: 2e-5,
  view: { x0: -1.3, x1: 1.3, y0: -1.12, y1: 0.18 },
  bare: true,
  answers: { "v@p3": [Math.sqrt(2 * 10 * h), 1e-3] },
  parts: [
    { to: (m) => m.events.end, pace: 2, caption: "באיזו נקודה, או באילו נקודות, התאוצה המשיקית הכי גדולה?" },
    { to: (m) => m.events.end, pace: 2, caption: "באיזו נקודה, או באילו נקודות, המהירות הכי גדולה?" },
    { to: (m) => m.events.p3, pace: 2, caption: "בנקודה 3: האם המתיחות בחוט גדולה מכוח הכובד, קטנה ממנו או שווה לו?" },
    { to: (m) => m.events.p3, pace: 2, caption: "מה הכוח השקול על הכדור בנקודה 3, לפי m, L, g ו-h?" },
    { to: (m) => m.events.end, pace: 2, caption: "ניסוי 1 מנקודה 1, ניסוי 2 מנקודה 2. האם הזמן עד הנקודה הנמוכה שונה?" },
    { to: (m) => m.events.end, pace: 2, caption: "מה היחס בין המרחקים האופקיים D1 ו-D2?" },
  ],
  extra: (P, m, t, part) => {
    P.line(-0.3, 0, 0.3, 0, { tone: "line", w: 3 });
    P.poly(arc(0, 0, L, -a0, a0, 80), { close: false, fill: "none", tone: "idle", w: 1, dash: "4 4" });
    [-a0, -a0 / 2, 0, a0 / 2, a0].forEach((a, i) => { const x = L * Math.sin(a), y = -L * Math.cos(a); P.circle(x, y, 3, { fill: "data" }); P.mono(x, y, String(i + 1), { tone: "data", size: 12, dyPx: 18 }); });
    P.dim(-L * Math.sin(a0) - 0.15, -L, -L * Math.sin(a0) - 0.15, -L + h, "h", { offPx: 0 });
    const b = m.state(t).b;
    P.line(0, 0, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 8, { fill: "body" });
    if (part === 0) askLabel(P, 0, -L, "aT max ?", 0, 34);
    if (part === 1) askLabel(P, 0, -L, "v max ?", 0, 34);
    if (part === 2 && t >= m.events.p3 - 1e-9) askLabel(P, 0, -L / 2, "T ? mg", 14, 0);
    if (part === 3 && t >= m.events.p3 - 1e-9) askLabel(P, 0, -L, "ΣF = ?", 20, 30);
    if (part === 4) askLabel(P, 0, -L, "t₁ ? t₂", 0, 34);
    if (part === 5) askLabel(P, 0, -L, "D₁ / D₂ = ?", 0, 34);
  },
});
