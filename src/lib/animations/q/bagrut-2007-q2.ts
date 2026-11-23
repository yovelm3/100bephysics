import { body } from "../engine";
import { askLabel, askSpan, storySpec } from "../kits";

/**
 * 2007 q2: A (3 kg) held by a student, B (2 kg) hangs from A on a string. From 0 to 0.5 s the student pulls A up with
 * 70 N (a = 4 m/s²); at 0.5 s he lets go and the string breaks. A rises to 0.7 m above its start and is back at 1.074 s.
 */
const g = 10, m1 = 3, m2 = 2, F = 70, yA = 1.6, yB = 0.8;
const a = (F - (m1 + m2) * g) / (m1 + m2);
export const spec = storySpec({
  id: "bagrut-2007-q2",
  view: { x0: -2.4, x1: 2.4, y0: -0.2, y1: 2.6 },
  scale: 2,
  story: {
    init: { A: body(0, yA, 0, 0), B: body(0, yB, 0, 0) },
    phases: [
      // build 2: A with F, its weight and the string T down; B with T up and its weight
      { end: "let", acc: { A: [0, a], B: [0, a] }, dur: () => 0.5, force: () => { const T = (m2 * F) / (m1 + m2); return { A: [0, (F - m1 * g - T) / m1], B: [0, (T - m2 * g) / m2] }; }, until: (_s, t) => t >= 0.5 - 1e-12 },
      { end: "top", acc: { A: [0, -g], B: [0, -g] }, dur: (s) => s.A.vy / g, force: () => ({ A: [0, -g], B: [0, -g] }), until: (s) => s.A.vy <= 0 },
      { end: "back", acc: { A: [0, -g], B: [0, -g] }, dur: (s) => Math.sqrt((2 * (s.A.y - yA)) / g), force: () => ({ A: [0, -g], B: [0, -g] }), until: (s) => s.A.y <= yA },
    ],
    record: { T: ["let", (s) => m2 * (g + s.B.vy / 0.5)], hMax: ["top", (s) => s.A.y - yA] },
  },
  order: ["let", "top", "back"],
  answers: { T: [28, 1e-9], hMax: [0.7, 1e-9], back: [1.0741657386773942, 1e-9] },
  parts: [
    { to: () => 0.5, pace: 2.5, caption: "התלמיד מושך את A כלפי מעלה בכוח של 70 N. מה המתיחות בחוט בין הגופים?" },
    { to: (m) => m.events.top, pace: 2.5, caption: "ב-0.5 s התלמיד עוזב את A והחוט נקרע. לאיזה גובה מרבי עולה A, ביחס למקום שלו ב-t = 0?" },
    { to: (m) => m.events.back, pace: 2.5, hideClock: true, caption: "באיזה רגע חוזר A לגובה שבו היה ב-t = 0?" },
    { to: (m) => m.events.back, pace: 2.5, caption: "אילו הניסוי היה במעלית שעולה במהירות קבועה: האם הזמן היה משתנה?" },
    { to: (m) => m.events.back, pace: 2.5, caption: "נסחו את עקרון היחסות של גלילאו." },
  ],
  draw: (P, m, t, part) => {
    const s = m.state(t), let_ = t >= 0.5 - 1e-9;
    P.ground(0, -2.2, 2.2);
    P.line(-0.6, yA, 0.6, yA, { tone: "idle", w: 1, dash: "4 4" });
    if (!let_) { P.line(0, s.A.y + 0.12, 0, s.A.y + 0.5, { tone: "runner", w: 3 }); P.arrowPx(0.25, s.A.y + 0.3, 0, -46, { tone: "force", label: "70 N" }); P.line(0, s.A.y - 0.12, 0, s.B.y + 0.1, { tone: "line", w: 1.4 }); }
    P.block(0, s.A.y, { wPx: 34, hPx: 28, base: false, label: "A" });
    P.block(0, s.B.y, { wPx: 28, hPx: 24, base: false, label: "B", tone: "b2" });
    if (Math.abs(s.A.vy) > 0.05) P.arrowPx(-0.4, s.A.y, 0, -s.A.vy * 20, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, 0, (s.A.y + s.B.y) / 2, "T = ?", 20, 0);
    if (part === 1 && t >= m.events.top - 1e-9) askSpan(P, 0.7, yA, s.A.y, "h = ?", 0);
    if (part === 2 && t >= m.events.back - 1e-9) askLabel(P, 0, yA, "t = ?", 30, -20);
    if (part === 3) { P.poly([[-1.6, 0.05], [1.6, 0.05], [1.6, 2.5], [-1.6, 2.5]], { fill: "none", tone: "idle", dash: "6 4" }); P.heb(-1.2, 2.3, "מעלית?", { tone: "ask", size: 12 }); }
  },
});
