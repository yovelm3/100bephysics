import { body } from "../engine";
import { askLabel, askSpan, fallPhase, storySpec } from "../kits";

/** 2007 q3: a 0.25 kg ball thrown at vx = 3, vy = 2 m/s from 0.6 m above the ground (lands at 0.6 s); part ה: a 2 N force against vx. */
export const spec = storySpec({
  id: "bagrut-2007-q3",
  view: { x0: -0.4, x1: 2.4, y0: -0.1, y1: 1.0 },
  scale: 2,
  scenarios: {
    free: {
      init: { b: body(0, 0.6, 3, 2) },
      phases: [
        { end: "top", acc: { b: [0, -10] }, dur: (s) => s.b.vy / 10, force: () => ({ b: [0, -10] }), until: (s) => s.b.vy <= 0 },
        fallPhase({ end: "land", body: "b", toY: 0 }),
      ],
      record: { Ek: ["top", (s) => 0.5 * 0.25 * (s.b.vx ** 2 + s.b.vy ** 2)] },
    },
    force: {
      init: { b: body(0, 0.6, 3, 2) },
      phases: [
        { end: "vx0", acc: { b: [-8, -10] }, dur: (s) => s.b.vx / 8, force: () => ({ b: [-2 / 0.25, -10] }), until: (s) => s.b.vx <= 0 },
        { ...fallPhase({ end: "land", body: "b", toY: 0, ax: -8 }) },
      ],
    },
  },
  order: { free: ["top", "land"], force: ["vx0", "land"] },
  answers: { "free.land": [0.6, 1e-9], "free.Ek": [1.125, 1e-9] },
  parts: [
    { to: (m) => m.events["free.land"], pace: 4, caption: "לפי גרפי רכיבי המהירות: האם הכדור נזרק מעל האופק או מתחת לו?" },
    { to: () => 0.02, pace: 4, caption: "מה הגודל ומה הכיוון של המהירות ההתחלתית?" },
    { to: (m) => m.events["free.land"], pace: 4, caption: "הכדור פוגע בקרקע ברגע t = 0.6 s. מאיזה גובה הוא נזרק?" },
    { to: (m) => m.events["free.top"], pace: 4, caption: "מה האנרגיה הקינטית של הכדור בשיא המסלול?" },
    { to: (m) => m.events["force.land"], pace: 4, caption: "עכשיו פועל כוח אופקי קבוע נגד הרכיב האופקי של המהירות. איך משתנה הרכיב האופקי של המהירות עד הפגיעה?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -0.3, 2.3);
    const key = part === 4 ? "force" : "free";
    const end = m.events[`${key}.land`];
    const b = m.state(Math.min(t, end))[`${key}.b`];
    P.ball(b.x, b.y, { rPx: 7 });
    if (part === 1) { P.arrowPx(0, 0.6, 3 * 24, -2 * 24, { tone: "ask" }); askLabel(P, 0, 0.6, "v₀ = ?, θ = ?", 70, -50); }
    else { P.arrowPx(b.x, b.y + 0.03, b.vx * 14, 0, { tone: "vel", label: "vₓ" }); P.arrowPx(b.x, b.y + 0.03, 0, -b.vy * 14, { tone: "vel", label: "vᵧ" }); }
    if (part === 2 && t >= end - 1e-9) askSpan(P, 0, 0, 0.6, "h = ?", -30);
    if (part === 3 && t >= m.events["free.top"] - 1e-9) askLabel(P, b.x, b.y, "Eₖ = ?", 14, -20);
    if (part === 4) { P.arrowPx(b.x, b.y + 0.03, -40, 0, { tone: "force", label: "F" }); askLabel(P, b.x, b.y, "vₓ(t) ?", 14, 30); }
  },
});
