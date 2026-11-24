import { body } from "../engine";
import { askLabel, storySpec } from "../kits";
import { disk } from "./_space";

/**
 * 1990c q1: a star of the Sun's radius (7·10⁵ km) shrinks, keeping its mass, to 7 km. Drawn on a log scale of the
 * radius: the model's s.x is log10 of the radius in km, falling at a steady rate.
 */
const a = 5 + Math.log10(7), b = Math.log10(7);
export const spec = storySpec({
  id: "bagrut-1990c-q1",
  view: { x0: -8, x1: 8, y0: -4, y1: 4 },
  scale: 5,
  story: { init: { s: body(a, 0, -1, 0) }, phases: [{ end: "small", acc: {}, dur: () => a - b, force: () => ({}), until: (q) => q.s.x <= b }], record: { k: ["small", (q) => 10 ** (2 * (a - q.s.x))] } },
  order: ["small"],
  answers: { k: [1e10, 1e3] },
  parts: [{ to: (m) => m.events.small, pace: 1, hideClock: true, caption: "הכוכב מתכווץ לרדיוס של 7 ק\"מ בלי לאבד מסה. פי כמה גדלה תאוצת הנפילה החופשית על פניו?" }],
  draw: (P, m, t) => {
    const s = m.state(t).s;
    // drawn radius: 0.4 + 0.55·log10(radius in km)
    disk(P, 0, 0, 0.4 + 0.55 * s.x, "soft");
    P.mono(0, 0, `R`, { tone: "data", size: 12 });
    if (t >= m.events.small - 1e-9) askLabel(P, 0, 0.6, "g / g₀ = ?", 20, -20);
  },
});
