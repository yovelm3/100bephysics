import { body } from "../engine";
import { askLabel, storySpec } from "../kits";
import { disk } from "./_space";

/** 1986c q30: a hole 500 km deep toward the center of a uniform Earth (6400 km); a body is lowered slowly (100 km per second, drawn) to its bottom. */
const R = 6.4e6, D = 5e5, u = 1e5;
export const spec = storySpec({
  id: "bagrut-1986c-q30",
  view: { x0: -1.5e7, x1: 1.5e7, y0: -7.5e6, y1: 7.5e6 },
  scale: D,
  story: { init: { b: body(0, R, 0, -u) }, phases: [{ end: "bottom", acc: {}, dur: () => D / u, force: () => ({}), until: (s) => s.b.y <= R - D, jump: (s) => { s.b.vy = 0; } }], record: { w: ["bottom", (s) => (100 * s.b.y) / R] } },
  order: ["bottom"],
  answers: { w: [92.1875, 1e-9] },
  parts: [{ to: (m) => m.events.bottom, pace: 1, hideClock: true, caption: "חופרים בור לעומק 500 km. כמה אחוזים ממשקלו על פני כדור הארץ שוקל גוף על קרקעית הבור?" }],
  draw: (P, m, t) => {
    disk(P, 0, 0, R, "soft");
    P.poly([[-1.5e5, R], [1.5e5, R], [1.5e5, R - D], [-1.5e5, R - D]], { tone: "line", fill: "none" });
    const b = m.state(t).b;
    P.circle(0, b.y, 5, { fill: "body" });
    if (t >= m.events.bottom - 1e-9) askLabel(P, 0, b.y, "W / W₀ = ?", 20, 10);
  },
});
