import type { AnimSpec } from "../engine";
import { askLabel, springApart } from "../kits";

/**
 * 2017 q3: A (300 g) and B (100 g) with a spring between them (K = 480 N/m, compressed from 20 cm to 10 cm), held by a
 * string. The string breaks and the spring pushes them apart: 2.4 J, so uA = 2 m/s and uB = 6 m/s.
 */
const run = springApart({ ma: 0.3, mb: 0.1, k: 480, x0: 0.1, L0: 0.2, tEnd: 0.25 });
export const spec: AnimSpec = {
  id: "bagrut-2017-q3",
  view: { x0: -0.65, x1: 1.65, y0: -0.2, y1: 0.95 },
  formula: run.formula,
  simulation: run.simulation,
  order: ["free", "end"],
  scale: 0.5,
  answers: { va: [-2, 1e-9], vb: [6, 1e-9], E: [2.4, 1e-9] },
  parts: [
    { to: (m) => m.events.free + 0.02, pace: 10, caption: "החוט נקרע והקפיץ דוחף את התיבות. האם התנע של המערכת נשמר עד שהתיבות עוזבות את הקפיץ?" },
    { to: (m) => m.events.free + 0.02, pace: 10, caption: "האם האנרגיה המכנית של המערכת נשמרת בזמן הזה?" },
    { to: (m) => m.events.end, pace: 6, caption: "מה גודל המהירות uA?" },
    { to: (m) => m.events.end, pace: 6, caption: "מה גודל המהירות uB?" },
    { to: (m) => m.events.end, pace: 6, caption: "A מגיעה למדרון, עולה עד גובה 0.1 m וגולשת חזרה. הוכיחו שהמדרון לא חלק." },
    { to: (m) => m.events.end, pace: 6, caption: "תולים על המוט של A מטוטלת קטנה בזמן שהיא נעה על המשטח האופקי. איזה איור מתאר אותה נכון?" },
  ],
  draw: (P, m, t, part) => {
    const s = m.state(t), free = t >= m.events.free - 1e-9;
    P.line(-0.6, 0, 1.6, 0, { tone: "line", w: 2 });
    if (!free) P.spring(s.a.x + 0.05, 0.05, s.b.x - 0.04, 0.05, { coils: 8, ampPx: 6 });
    else P.spring(-0.04, 0.02, 0.16, 0.02, { coils: 8, ampPx: 4 });
    P.block(s.a.x - 0.03, 0, { wPx: 40, hPx: 30, label: "A" });
    P.block(s.b.x + 0.02, 0, { wPx: 26, hPx: 22, label: "B", tone: "b2" });
    if (!free) { P.line(s.a.x - 0.03, 0.12, s.a.x - 0.03, 0.3, { tone: "line", w: 2 }); P.line(s.b.x + 0.02, 0.1, s.b.x + 0.02, 0.3, { tone: "line", w: 2 }); if (t < 0.005) P.line(s.a.x - 0.03, 0.28, s.b.x + 0.02, 0.28, { tone: "runner", w: 1.4 }); }
    if (free) { P.arrowPx(s.a.x, 0.45, s.a.vx * 10, 0, { tone: "vel", label: "uA" }); P.arrowPx(s.b.x, 0.45, s.b.vx * 10, 0, { tone: "vel", label: "uB" }); }
    if (part === 0) askLabel(P, 0.5, 0.8, "p = const ?", 0, 0);
    if (part === 1) askLabel(P, 0.5, 0.8, "E = const ?", 0, 0);
    if (part === 2 && free) askLabel(P, s.a.x, 0.45, "uA = ?", -20, -16);
    if (part === 3 && free) askLabel(P, s.b.x, 0.45, "uB = ?", 20, -16);
    if (part === 4) askLabel(P, s.a.x, 0.2, "?", -20, -16);
    if (part === 5) askLabel(P, s.a.x, 0.2, "?", -20, -16);
  },
};
