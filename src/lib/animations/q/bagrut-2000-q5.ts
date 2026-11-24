import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2000 q5 (from above): disk I (1 kg) at 10 m/s along x hits disk II (1 kg) at rest at the origin. After it, II moves at
 * 4 m/s at 60° to x; I's velocity follows from momentum: 8.72 m/s at −23.4°. The hit is drawn as instant.
 */
const u2 = 4, a2 = Math.PI / 3;
export const spec = storySpec({
  id: "bagrut-2000-q5",
  view: { x0: -3.2, x1: 4.2, y0: -2.3, y1: 2.6 },
  scale: 5,
  story: {
    init: { I: body(-3, 0, 10, 0), II: body(0, 0, 0, 0) },
    phases: [
      { end: "hit", acc: {}, dur: () => 0.3, force: () => ({}), until: (s) => s.I.x >= 0,
        jump: (s) => { s.II.vx = u2 * Math.cos(a2); s.II.vy = u2 * Math.sin(a2); s.I.vx = 10 - s.II.vx; s.I.vy = -s.II.vy; } },
      { end: "end", acc: {}, dur: () => 0.4, force: () => ({}), until: (_s, t, t0) => t - t0 >= 0.4 - 1e-12 },
    ],
    record: { p: ["end", (s) => Math.hypot(s.I.vx + s.II.vx, s.I.vy + s.II.vy)], u1: ["end", (s) => Math.hypot(s.I.vx, s.I.vy)], ang: ["end", (s) => (Math.atan2(-s.I.vy, s.I.vx) * 180) / Math.PI] },
  },
  order: ["hit", "end"],
  answers: { p: [10, 1e-9], u1: [8.717797887081346, 1e-9], ang: [23.41322444637054, 1e-9] },
  parts: [
    { to: (m) => m.events.end, pace: 3, caption: "מה התנע הכולל של שתי הדסקיות אחרי ההתנגשות, בגודל ובכיוון?" },
    { to: (m) => m.events.end, pace: 3, caption: "למה אי אפשר ששתי הדסקיות ינועו אחרי ההתנגשות ברביע הרביעי?" },
    { to: (m) => m.events.end, pace: 3, caption: "מה גודל המהירות של דסקית I אחרי ההתנגשות?" },
    { to: (m) => m.events.end, pace: 3, caption: "מה הזווית בין כיוון התנועה של דסקית I לבין ציר x?" },
  ],
  draw: (P, m, t, part) => {
    P.arrow(-3.1, 0, 4.1, 0, { tone: "line", w: 1 }); P.mono(4.1, 0, "x", { tone: "text", size: 12, dyPx: 14 });
    P.arrow(0, -2.2, 0, 2.5, { tone: "line", w: 1 }); P.mono(0, 2.5, "y", { tone: "text", size: 12, dxPx: 10 });
    const s = m.state(t), after = t >= m.events.hit - 1e-9;
    P.circle(s.II.x, s.II.y, 10, { fill: "b2" }); P.mono(s.II.x, s.II.y, "II", { tone: "b2", size: 11, dyPx: -14 });
    P.circle(s.I.x, s.I.y, 10, { fill: "body" }); P.mono(s.I.x, s.I.y, "I", { tone: "body", size: 11, dyPx: -14 });
    P.arrowPx(s.II.x, s.II.y, s.II.vx * 10, -s.II.vy * 10, { tone: "vel" });
    if (!after || part === 0 || part === 1) P.arrowPx(s.I.x, s.I.y, s.I.vx * 6, -s.I.vy * 6, { tone: "vel" });
    if (part === 0 && after) askLabel(P, 2, 1.8, "p = ?", 0, 0);
    if (part === 1) askLabel(P, 2, -1.8, "?", 0, 0);
    if ((part === 2 || part === 3) && after) askLabel(P, s.I.x, s.I.y, part === 2 ? "u₁ = ?" : "θ = ?", 16, 20);
  },
});
