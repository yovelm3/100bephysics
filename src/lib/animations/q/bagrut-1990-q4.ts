import { body } from "../engine";
import { askLabel, fallPhase, joinSpecs, storySpec } from "../kits";
import { shmSpec } from "./_shm";

/**
 * 1990 q4: 0.5 kg on a spring of 50 N/m (ω = 10 s⁻¹); at rest at O, 2 m above the floor; lifted 8 cm to A and let go.
 * Part ג: going down, it comes off the spring at O (0.8 m/s) and falls to the floor.
 */
const osc = shmSpec({
  id: "bagrut-1990-q4", k: 50, m: 0.5, A: 0.08, vertical: true, L0: 0.3, periods: 1,
  answers: { vmax: [0.8, 1e-3] },
  parts: [
    { caption: "המשקולת משוחררת ממנוחה ב-A, 8 ס\"מ מעל O. כמה זמן עד שהיא מגיעה לראשונה ל-O?", ask: "t = ?", until: 0.3, clock: false,
      holds: (m) => [{ at: m.events.eq1, label: "עוברת בנקודה O", where: [0, -0.3], secs: 1.6 }] },
    { caption: "בין O ל-A, כשהיא עולה: מה הכיוון של הכוח השקול? שימו לב איך המהירות משתנה בקטע הזה.", ask: "ΣF ?", from: 0.7, until: 1,
      holds: (m) => [{ at: m.events.eq2, label: "עוברת ב-O כלפי מעלה", where: [0, -0.3] }, { at: m.events.turn2, label: "נעצרת לרגע ב-A", where: [0, -0.22] }] },
  ],
  extra: (P, y, t, part) => {
    // data where it acts: the spring and the mass, and A, 8 cm above O
    P.mono(0.12, -0.15, "K = 50 N/m", { tone: "data", size: 11, anchor: "start" });
    P.mono(0.06, y, "0.5 kg", { tone: "data", size: 11, anchor: "start", dxPx: 16 });
    P.line(-0.12, -0.22, -0.075, -0.22, { tone: "idle", w: 1, dash: "3 3" }); P.mono(-0.126, -0.22, "A", { tone: "data", size: 11, anchor: "end" });
    if (part === 0 && t < 0.05) P.dim(0.1, -0.3, 0.1, -0.22, "8 cm", { offPx: 0 });
  },
});
const fall = storySpec({
  id: "bagrut-1990-q4",
  view: { x0: -2.2, x1: 2.2, y0: -0.1, y1: 2.1 },
  scale: 2,
  story: { init: { b: body(0, 2, 0, -0.8) }, phases: [fallPhase({ end: "floor", body: "b", toY: 0 })] },
  order: ["floor"],
  answers: { floor: [0.5574950980203691, 1e-6] },
  parts: [{ to: (m) => m.events.floor, pace: 2, hideClock: true, caption: "בדרך למטה, כשהמהירות הכי גדולה, המשקולת ניתקת מהקפיץ ב-O, 2 m מעל הרצפה. כמה זמן עד שהיא מגיעה לרצפה?",
    holds: (m) => [{ at: 0.02, label: "ניתקת: מעכשיו רק כוח הכובד", where: [0, 2] }, { at: m.events.floor, label: "פוגעת ברצפה", where: [0, 0.1] }] }],
  draw: (P, m, t) => {
    P.ground(0, -2, 2);
    P.line(-0.6, 2.05, 0.6, 2.05, { tone: "idle", w: 1, dash: "3 3" }); P.mono(-0.65, 2.05, "O", { tone: "data", size: 11, anchor: "end" });
    const b = m.state(t).b;
    P.block(0, b.y, { wPx: 26, hPx: 22 });
    P.dim(0.9, 0, 0.9, 2, "2 m", { offPx: 0 });
    P.arrowPx(0.3, b.y + 0.1, 0, -b.vy * 14, { tone: "vel", label: "v" });
    if (t >= m.events.floor - 1e-9) askLabel(P, 0, 0, "t = ?", 30, -20);
  },
});
export const spec = joinSpecs("bagrut-1990-q4", [{ key: "osc", spec: osc, parts: [0, 1] }, { key: "fall", spec: fall, parts: [0] }]);
