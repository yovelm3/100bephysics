import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1998 q2 (from above): a wagon floor (12 × 12 squares, one square = 1 m/s in the velocity drawings, drawn as 1 m here).
 * Figure א: m at (10, 8) with velocity (−6, −8), 2m at (1, 1) with (0, 4). With the wagon tied, m bounces elastically
 * off the near side (y = 0): its velocity becomes (−6, 8), as in figure ב.
 */
export const spec = storySpec({
  id: "bagrut-1998-q2",
  view: { x0: -1, x1: 13, y0: -0.5, y1: 12.5 },
  scale: 12,
  story: {
    init: { m: body(10, 8, -6, -8), M: body(1, 1, 0, 4) },
    phases: [
      { end: "wall", acc: {}, dur: (s) => s.m.y / -s.m.vy, force: () => ({}), until: (s) => s.m.y <= 0, jump: (s) => { s.m.vy = -s.m.vy; } },
      { end: "end", acc: {}, dur: () => 0.5, force: () => ({}), until: (_s, t, t0) => t - t0 >= 0.5 - 1e-12 },
    ],
    record: { py: ["end", (s) => 1 * s.m.vy + 2 * s.M.vy], K: ["end", (s) => 0.5 * (s.m.vx ** 2 + s.m.vy ** 2) + (s.M.vx ** 2 + s.M.vy ** 2)] },
  },
  order: ["wall", "end"],
  answers: { py: [16, 1e-9], K: [66, 1e-9] },
  parts: [
    { to: (m) => m.events.end, pace: 1, caption: "הקרון קשור. m פוגע בדופן. האם התנע הכולל של שני הכדורים אחרי הפגיעה שווה לתנע לפניה?" },
    { to: (m) => m.events.end, pace: 1, caption: "האם האנרגיה הקינטית הכוללת של הכדורים אחרי הפגיעה שווה לזו שלפניה?" },
    { to: (m) => m.events.end, pace: 1, caption: "עכשיו הקרון חופשי. למה תרשים ג לא יכול לתאר את המערכת אחרי התנגשויות אלסטיות?" },
    { to: (m) => m.events.end, pace: 1, caption: "למה תרשים ד לא יכול לתאר את המערכת אחרי התנגשויות אלסטיות?" },
  ],
  draw: (P, mm, t, part) => {
    for (let i = 0; i <= 12; i++) { P.line(i, 0, i, 12, { tone: "soft", w: 0.6 }); P.line(0, i, 12, i, { tone: "soft", w: 0.6 }); }
    P.poly([[0, 0], [12, 0], [12, 12], [0, 12]], { fill: "none", tone: "line", w: 2.4 });
    const s = mm.state(t);
    P.circle(s.m.x, s.m.y, 6, { fill: "body" }); P.mono(s.m.x, s.m.y, "m", { tone: "body", size: 11, dxPx: 10 });
    P.circle(s.M.x, s.M.y, 9, { fill: "b2" }); P.mono(s.M.x, s.M.y, "2m", { tone: "b2", size: 11, dxPx: 14 });
    P.arrowPx(s.m.x, s.m.y, s.m.vx * 4, -s.m.vy * 4, { tone: "vel" });
    P.arrowPx(s.M.x, s.M.y, s.M.vx * 4, -s.M.vy * 4, { tone: "vel" });
    const after = t >= mm.events.wall;
    if (part === 0 && after) askLabel(P, 6, 11, "p = ?", 0, 0);
    if (part === 1 && after) askLabel(P, 6, 11, "K = ?", 0, 0);
    if (part >= 2) askLabel(P, 6, 11, "?", 0, 0);
  },
});
