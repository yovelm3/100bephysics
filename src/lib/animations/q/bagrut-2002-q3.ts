import { body } from "../engine";
import { arc, askLabel, askWidth, fallPhase, joinSpecs, storySpec, trackMotion } from "../kits";

/**
 * 2002 q3: a big ball M on a string is let go h above the small ball m at the table's edge; it hits it at v and goes on
 * at 3v/4, so m flies off at u = M·v/(4m) and lands d from the table. Drawn: M = 140 g, m = 20 g, H = 0.9 m, h = 0.1 m,
 * string 0.5 m.
 */
const g = 10, M = 0.14, m = 0.02, H = 0.9, h = 0.1, L = 0.5;
const v = Math.sqrt(2 * g * h), u = (M * v) / (4 * m);
const a0 = Math.acos(1 - h / L);
const swing = trackMotion({
  id: "bagrut-2002-q3",
  path: arc(-0.05, H + L, L, -a0, 0, 400),
  dt: 2e-5,
  view: { x0: -0.7, x1: 1.5, y0: -0.1, y1: 1.5 },
  bare: true,
  answers: { vEnd: [v, 2e-3] },
  parts: [{ to: (mm) => mm.events.end, pace: 2, caption: "הכדור הגדול משוחרר מגובה h ופוגע בכדור הקטן. מה המהירות u של הכדור הקטן רגע אחרי ההתנגשות?" }],
  extra: (P, mm, t) => {
    P.poly([[-0.6, 0], [0, 0], [0, H - 0.02], [-0.6, H - 0.02]]); P.ground(0, -0.6, 1.45);
    const b = mm.state(t).b;
    P.line(-0.05, H + L, b.x, b.y, { tone: "line", w: 1.4 });
    P.circle(b.x, b.y, 10, { fill: "b2" });
    P.circle(0.01, H, 5, { fill: "body" });
    if (t >= mm.events.end - 1e-9) askLabel(P, 0.01, H, "u = ?", 20, -20);
  },
});
const fly = storySpec({
  id: "bagrut-2002-q3",
  view: { x0: -0.7, x1: 1.5, y0: -0.1, y1: 1.5 },
  scale: 1.5,
  story: { init: { s: body(0.01, H, u, 0) }, phases: [fallPhase({ end: "land", body: "s", toY: 0 })], record: { d: ["land", (q) => q.s.x - 0.01] } },
  order: ["land"],
  answers: { d: [u * Math.sqrt((2 * H) / g), 1e-9] },
  parts: [
    { to: (mm) => mm.events.land, pace: 2, caption: "הכדור הקטן עף מקצה השולחן ונוחת במרחק d. הוכיחו ש-d² = HM²h/(4m²)." },
    { to: (mm) => mm.events.land, pace: 2, caption: "משנים את h ומודדים את d. מה השיפוע של הגרף של d² כפונקציה של h?" },
  ],
  draw: (P, mm, t, part) => {
    P.poly([[-0.6, 0], [0, 0], [0, H - 0.02], [-0.6, H - 0.02]]); P.ground(0, -0.6, 1.45);
    P.line(-0.05, H + L, -0.05, H + 0.01, { tone: "line", w: 1.4 }); P.circle(-0.05, H, 10, { fill: "b2" });
    const s = mm.state(t).s;
    P.circle(s.x, s.y, 5, { fill: "body" });
    if (t >= mm.events.land - 1e-9) askWidth(P, 0, s.x, 0, part === 0 ? "d" : "d² (h) ?", 30);
  },
});
export const spec = joinSpecs("bagrut-2002-q3", [{ key: "swing", spec: swing, parts: [0] }, { key: "fly", spec: fly, parts: [0, 1] }]);
