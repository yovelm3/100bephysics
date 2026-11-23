import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1998 q3: a weight hangs from a spring scale in a car with constant acceleration; the string makes the angle α with
 * the vertical (drawn α = 20°, as in the figure, so a = g·tan α). Figure ב: up a straight hill at constant speed.
 */
const g = 10, al = (20 * Math.PI) / 180, a = g * Math.tan(al), hill = (18 * Math.PI) / 180;
export const spec = storySpec({
  id: "bagrut-1998-q3",
  view: { x0: -1, x1: 15, y0: -0.6, y1: 7.4 },
  scale: 14,
  scenarios: {
    flat: { init: { c: body(0, 0, 0, 0) }, phases: [{ end: "end", acc: { c: [a, 0] }, dur: () => 2, force: () => ({ c: [g * Math.tan(al), 0] }), until: (_s, t) => t >= 2 - 1e-12 }] },
    hill: { init: { c: body(0, 0, 3, 0) }, phases: [{ end: "end", acc: {}, dur: () => 2, force: () => ({}), until: (_s, t) => t >= 2 - 1e-12 }] },
  },
  order: { flat: ["end"], hill: ["end"] },
  answers: { "flat.end": [2, 1e-9] },
  parts: [
    { to: () => 2, pace: 1.2, caption: "המשקולת במנוחה ביחס למכונית, והחוט נטוי בזווית α. האם הכוח השקול עליה אפס?" },
    { to: () => 2, pace: 1.2, caption: "האם הכוח שמראה מד הכוח קטן מ-mg, גדול ממנו או שווה לו?" },
    { to: () => 2, pace: 1.2, caption: "התאוצה ימינה. האם המכונית יכולה לנסוע ימינה? שמאלה?" },
    { to: () => 2, pace: 1.2, caption: "המכונית עולה בגבעה במהירות קבועה, והחוט אנכי. מה מראה מד הכוח?" },
  ],
  draw: (P, m, t, part) => {
    const onHill = part === 3;
    const s = m.state(t)[onHill ? "hill.c" : "flat.c"];
    const ang = onHill ? hill : 0;
    const c = Math.cos(ang), sn = Math.sin(ang);
    const R = (x: number, y: number): [number, number] => [s.x * c + 1 + x * c - y * sn, s.x * sn + 0.3 + x * sn + y * c];
    if (onHill) P.line(-1, -sn * 2, 15, 15 * Math.tan(ang), { tone: "line", w: 2.4 }); else P.ground(0, -0.8, 14.8);
    P.poly([R(0, 0), R(3.2, 0), R(3.2, 2.4), R(0, 2.4)], { fill: "none" });
    const w1 = R(0.7, -0.3), w2 = R(2.5, -0.3);
    P.circle(w1[0], w1[1], 7, { fill: "line" }); P.circle(w2[0], w2[1], 7, { fill: "line" });
    // the string from the roof: tilted back by α on the flat road, vertical (not perpendicular to the roof) on the hill
    const top = R(1.6, 2.4);
    const L = 1.5, dirA = onHill ? 0 : -al;
    const bob: [number, number] = [top[0] + L * Math.sin(dirA), top[1] - L * Math.cos(dirA)];
    P.line(top[0], top[1], bob[0], bob[1], { tone: "line", w: 1.6 });
    P.block((top[0] * 2 + bob[0]) / 3, (top[1] * 2 + bob[1]) / 3, { wPx: 8, hPx: 18, base: false, tone: "idle", angle: -dirA });
    P.ball(bob[0], bob[1] - 0.12, { rPx: 7 });
    if (!onHill) { P.line(top[0], top[1], top[0], top[1] - 1.3, { tone: "idle", w: 1, dash: "3 3" }); P.mono(top[0] - 0.15, top[1] - 0.8, "α", { tone: "data", size: 12, anchor: "end" }); }
    if (!onHill) P.arrowPx(R(1.6, 3.4)[0], R(1.6, 3.4)[1], 50, 0, { tone: "force", label: "a" });
    if (Math.abs(s.vx) > 0.05) P.arrowPx(R(1.6, 4.2)[0], R(1.6, 4.2)[1], s.vx * 8 * c, -s.vx * 8 * sn, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, bob[0], bob[1], "ΣF ?", 18, 10);
    if (part === 1 || part === 3) askLabel(P, top[0], top[1] - 0.5, "F ? mg", 20, 0);
    if (part === 2) askLabel(P, R(1.6, 4.2)[0], R(1.6, 4.2)[1], "← ? →", 0, -26);
  },
});
