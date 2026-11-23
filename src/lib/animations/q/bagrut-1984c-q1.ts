import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1984c q1: the spring stretches 2 cm with 8 kg hanging (k = 4000 N/m). Its two ends go over pulleys to 16 kg each.
 * Story: hands lower both masses slowly (each 1 cm/s, so the spring stretches 2 cm/s) until the spring holds them.
 * The part asks for the stretch, so the window ends halfway, while the hands still hold the masses.
 */
const g = 10, k = (8 * g) / 0.02, M = 16, u = 0.01;
export const spec = storySpec({
  id: "bagrut-1984c-q1",
  view: { x0: -0.5, x1: 0.5, y0: -0.36, y1: 0.14 },
  scale: 0.1,
  story: {
    init: { L: body(-0.4, -0.2, 0, -u), R: body(0.4, -0.2, 0, -u) },
    phases: [{ end: "free", acc: {}, dur: () => (M * g) / k / (2 * u), force: () => ({}), until: (s) => k * 2 * (-0.2 - s.L.y) >= M * g, jump: (s) => { s.L.vy = 0; s.R.vy = 0; } }],
    record: { stretch: ["free", (s) => 2 * (-0.2 - s.L.y)] },
  },
  order: ["free"],
  answers: { stretch: [0.04, 1e-9] },
  parts: [
    { to: (mm) => mm.events.free / 2, pace: 1, caption: "קפיץ שמתארך ב-2 ס\"מ עם 8 ק\"ג. הידיים מורידות לאט את שתי המשקולות של 16 ק\"ג. בכמה יתארך הקפיץ כשהן יהיו תלויות חופשי?" },
  ],
  draw: (P, mm, t) => {
    const s = mm.state(t);
    const d = -0.2 - s.L.y; // how far each mass went down = how much each end of the spring moved
    P.line(-0.48, 0.12, 0.48, 0.12, { tone: "line", w: 3 });
    for (const x of [-0.4, 0.4]) { P.line(x, 0.12, x, 0.06, { tone: "line", w: 1.4 }); P.pulley(x, 0.04, 12); }
    P.line(-0.4, 0.06, -0.2 - d, 0.06, { tone: "line", w: 1.4 });
    P.spring(-0.2 - d, 0.06, 0.2 + d, 0.06, { coils: 10, ampPx: 7 });
    P.line(0.2 + d, 0.06, 0.4, 0.06, { tone: "line", w: 1.4 });
    for (const [b, x] of [[s.L, -0.42], [s.R, 0.42]] as const) {
      P.line(x, 0.04, x, b.y + 0.03, { tone: "line", w: 1.4 });
      P.block(x, b.y, { wPx: 34, hPx: 30, base: false, label: "16" });
      P.line(x - 0.035, b.y - 0.035, x + 0.035, b.y - 0.035, { tone: "runner", w: 4 });
    }
    P.mono(-0.42, -0.32, "16 kg", { tone: "data", size: 11 });
    P.mono(0.42, -0.32, "16 kg", { tone: "data", size: 11 });
    askLabel(P, 0, 0.06, "Δx = ?", 0, 34);
  },
});
