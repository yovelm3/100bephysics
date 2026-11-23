import { body, type State } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1985 q3: a tube fixed to a vertical axis at 75° to it; a body inside, 10 cm from the axis, μ = 0.5. The axis turns
 * faster and faster (drawn: ω grows 3 rad/s every second). Build 1: the closed-form ω where the body slips (outward,
 * up the tube). Build 2: at every step, the friction needed to keep the body in its circle is compared with μ·N.
 * The model's w.x is ω.
 */
const g = 10, al = (75 * Math.PI) / 180, r = 0.1, mu = 0.5, rate = 3;
const wStar = Math.sqrt((g * (Math.cos(al) + mu * Math.sin(al))) / (r * (Math.sin(al) - mu * Math.cos(al))));
const slips = (s: State) => {
  const w2 = s.w.x * s.w.x;
  const fNeed = g * Math.cos(al) - w2 * r * Math.sin(al); // along the tube, up positive (per kg)
  const N = g * Math.sin(al) + w2 * r * Math.cos(al);
  return -fNeed > mu * N;
};
export const spec = storySpec({
  id: "bagrut-1985-q3",
  view: { x0: -0.3, x1: 0.3, y0: -0.04, y1: 0.26 },
  scale: 1,
  story: {
    init: { w: body(0, 0, rate, 0) },
    phases: [{
      end: "slip",
      acc: {},
      dur: () => wStar / rate,
      force: () => ({}),
      until: (s) => slips(s),
    }],
    record: { w: ["slip", (s) => s.w.x] },
  },
  order: ["slip"],
  answers: { w: [9.416747559259134, 0.01] },
  parts: [
    { to: () => 0.6, pace: 1, caption: "הגוף בצינור, והציר עומד. אילו כוחות פועלים על הגוף, והאם הוא יזוז?" },
    { to: (m) => m.events.slip, pace: 1, caption: "מסובבים את הציר מהר יותר ויותר. לאיזה כיוון ינוע הגוף כשייתלש: מעלה או מטה?" },
    { to: (m) => m.events.slip, pace: 1, caption: "מה המהירות הזוויתית הקטנה ביותר שבה הגוף ייתלש?" },
  ],
  draw: (P, m, t, part) => {
    // the turned angle: ω grows linearly, so φ = rate·t²/2
    const phi = (rate * t * t) / 2;
    P.line(0, -0.03, 0, 0.25, { tone: "line", w: 3 });
    const Lt = 0.18, c = Math.cos(phi);
    const end: [number, number] = [Lt * Math.sin(al) * c, Lt * Math.cos(al)];
    P.line(0, 0, end[0], end[1], { tone: "line", w: 10 });
    P.line(0, 0, end[0], end[1], { tone: "soft", w: 6 });
    const d = r / Math.sin(al);
    P.circle(d * Math.sin(al) * c, d * Math.cos(al), 5, { fill: "body" });
    P.mono(0.17, 0.2, `75°`, { tone: "data", size: 11 });
    if (part === 0) askLabel(P, d * Math.sin(al) * c, d * Math.cos(al), "?", 16, -10);
    if (part === 1) askLabel(P, d * Math.sin(al) * c, d * Math.cos(al), "↗ ? ↙", 16, -10);
    if (part === 2) askLabel(P, 0, 0.24, "ω = ?", 16, 0);
  },
});
