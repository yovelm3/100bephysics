import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2013 q4: a tennis racket hits a 0.06 kg ball horizontally while the ball moves up at 5 m/s; the force graph gives an
 * impulse of about 2 N·s, so the ball leaves at 33.3 m/s horizontally plus 5 m/s up. The hit is drawn as instant.
 */
const g = 10, m = 0.06, J = 2;
export const spec = storySpec({
  id: "bagrut-2013-q4",
  view: { x0: -1.5, x1: 13.5, y0: -0.5, y1: 7 },
  scale: 12,
  story: {
    init: { b: body(0, 1, 0, 8) },
    phases: [
      { end: "hit", acc: { b: [0, -g] }, dur: () => 0.3, force: () => ({ b: [0, -g] }), until: (s) => s.b.vy <= 5, jump: (s) => { s.b.vx = J / m; } },
      { end: "end", acc: { b: [0, -g] }, dur: () => 0.3, force: () => ({ b: [0, -g] }), until: (_s, t, t0) => t - t0 >= 0.3 - 1e-12 },
    ],
    record: { v: ["hit", (s) => Math.hypot(s.b.vx, s.b.vy)] },
  },
  order: ["hit", "end"],
  answers: { v: [33.706247360261145, 1e-6] },
  parts: [
    { to: (mm) => mm.events.end, pace: 3, caption: "הראו שכשהמסה קבועה, קצב השינוי בתנע שווה ל-ma." },
    { to: (mm) => mm.events.end, pace: 3, caption: "לפי גרף הכוח: מה השינוי בתנע של הכדור בחבטה?" },
    { to: (mm) => mm.events.end, pace: 3, caption: "החבטה אופקית, כשהכדור עולה ב-5 m/s. מה המהירות שלו מיד אחרי החבטה?" },
    { to: (mm) => mm.events.hit, pace: 3, caption: "כדור פוגע ברצפה ב-12 m/s וחוזר ב-12 m/s. איזה היגד נכון?" },
  ],
  draw: (P, mm, t, part) => {
    P.ground(0, -1.4, 13.4);
    const b = mm.state(t).b, after = t >= mm.events.hit - 1e-9;
    if (!after) P.poly([[-0.9, b.y - 0.3], [-0.5, b.y - 0.3], [-0.5, b.y + 0.3], [-0.9, b.y + 0.3]], { tone: "runner", fill: "none" });
    P.circle(b.x, b.y, 6, { fill: "runner" });
    P.arrowPx(b.x, b.y, Math.min(b.vx * 2.4, 90), -b.vy * 2.4, { tone: "vel", label: "v" });
    if (part === 1) askLabel(P, 2, 6, "Δp = ?", 0, 0);
    if (part === 2 && after) askLabel(P, b.x, b.y, "v = ?, θ = ?", 10, -30);
    if (part === 0) askLabel(P, 2, 6, "Δp/Δt = ma ?", 0, 0);
    if (part === 3) askLabel(P, 6, 6, "(1) (2) (3) ?", 0, 0);
  },
});
