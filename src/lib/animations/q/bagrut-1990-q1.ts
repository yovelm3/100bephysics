import { body } from "../engine";
import { askLabel, askWidth, fallPhase, storySpec } from "../kits";

/** 1990 q1: a ball thrown horizontally from a 5 m roof at 5 m/s; then with an extra horizontal force of 0.2 N (m = 0.1 kg); then dropped with that force. */
const h = 5, v0 = 5, aF = 0.2 / 0.1;
const roof = () => ({ b: body(0, h, v0, 0) });
export const spec = storySpec({
  id: "bagrut-1990-q1",
  view: { x0: -2.5, x1: 8.5, y0: -0.6, y1: 6.4 },
  scale: 8,
  scenarios: {
    plain: { init: roof(), phases: [fallPhase({ end: "hit", body: "b", toY: 0 })], record: { xHit: ["hit", (s) => s.b.x], vHit: ["hit", (s) => Math.hypot(s.b.vx, s.b.vy)] } },
    force: { init: roof(), phases: [fallPhase({ end: "hit", body: "b", toY: 0, ax: aF })], record: { xHit: ["hit", (s) => s.b.x] } },
    drop: { init: { b: body(0, h, 0, 0) }, phases: [fallPhase({ end: "hit", body: "b", toY: 0, ax: aF })], record: { xHit: ["hit", (s) => s.b.x] } },
  },
  order: { plain: ["hit"], force: ["hit"], drop: ["hit"] },
  answers: { "plain.xHit": [5, 1e-9], "plain.vHit": [11.18, 0.01], "force.xHit": [6, 1e-9] },
  parts: [
    { to: (m) => m.events["plain.hit"], pace: 2.5, caption: "הכדור נזרק אופקית מהגג. באיזה מרחק מבסיס הבניין הוא פוגע בקרקע?" },
    { to: (m) => m.events["plain.hit"], pace: 2.5, caption: "המהירות האופקית נשארת, והמהירות האנכית גדלה. מה גודל המהירות ברגע הפגיעה?" },
    { to: (m) => m.events["force.hit"], pace: 2.5, caption: "עכשיו פועל על הכדור גם כוח אופקי קבוע בכיוון הזריקה. איפה הוא פוגע בקרקע?" },
    { to: (m) => m.events["drop.hit"], pace: 2.5, caption: "הכדור משוחרר ממנוחה, ופועל עליו אותו כוח אופקי. מה צורת המסלול שלו?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -2.4, 8.4);
    P.poly([[-1.6, 0], [0, 0], [0, h], [-1.6, h]]);
    P.dim(-1.6, 0, -1.6, h, "5 m", { offPx: 10 });
    const key = ["plain", "plain", "force", "drop"][part];
    const end = m.events[`${key}.hit`];
    const s = m.state(Math.min(t, end))[`${key}.b`];
    // the path so far (dots every 0.1 s), as the ball moves
    // no trail in part ד: the shape of the path is what is asked
    if (part < 3) for (let u = 0; u < Math.min(t, end); u += 0.1) { const p = m.state(u)[`${key}.b`]; P.circle(p.x, p.y, 2, { fill: "idle" }); }
    P.ball(s.x, s.y + 0.0, { rPx: 7 });
    if (t < 0.02 && part < 3) P.arrowPx(0, h + 0.3, 50, 0, { tone: "data", label: "5 m/s" });
    if (part >= 2) P.arrowPx(s.x, s.y + 0.25, 34, 0, { tone: "force", label: "F" });
    const done = t >= end - 1e-9;
    if (part === 0 && done) askWidth(P, 0, s.x, 0, "d = ?", 22);
    if (part === 1 && done) { P.arrowPx(s.x, 0.15, s.vx * 4, -s.vy * 4, { tone: "ask" }); askLabel(P, s.x, 0.5, "v = ?", 16, -10); }
    if (part === 2 && done) askWidth(P, 0, s.x, 0, "d = ?", 22);
    if (part === 3 && done) P.heb(s.x, 1.5, "מה צורת המסלול?", { tone: "ask", anchor: "start", dxPx: 10 });
  },
});
