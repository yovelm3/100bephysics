import { askLabel, askSpan, flash, graphMotion } from "../kits";

/** 1981 q1: a rocket on a planet: engines until 10 s, then only gravity, up to the top and back down to the surface. */
const tHit = 10 + 90 + Math.sqrt(9000); // fall from 9000 m with 2 m/s²
export const spec = graphMotion({
  id: "bagrut-1981-q1",
  vertical: true,
  v: [[0, 0], [10, 180], [tHit, 180 - 2 * (tHit - 10)]],
  names: ["launch", "burnout", "hit"],
  range: [0, 9800],
  graph: { vMin: -200, vMax: 200, tTicks: [10, 100], vTicks: [180], ghost: [[0, 0], [10, 180], [190, -180]] },
  answers: { "x@burnout": [900, 1e-6], "x@turn0": [9000, 1e-6], turn0: [100, 1e-9], "x@hit": [0, 1e-6], "a@0": [18, 1e-9], "v@hit": [-189.74, 0.01] },
  parts: [
    { to: (m) => m.events.burnout + 15, pace: 4, hideClock: true, caption: "המנועים פועלים, ובשלב מסוים הדלק נגמר. מתי זה קורה?",
      ask: (P, m, t) => { if (t >= m.events.burnout) askLabel(P, 0, m.state(m.events.burnout).b.x, "t = ?"); } },
    { to: (m) => m.events.turn0 + 10, pace: 6, hideClock: true, caption: "אחרי שהמנועים כבים הטיל ממשיך לעלות ומאט. מתי הוא בגובה המרבי?",
      ask: (P, m, t) => { if (t >= m.events.turn0) askLabel(P, 0, m.values["x@turn0"], "t = ?"); } },
    { to: (m) => m.events.burnout, pace: 3, caption: "בזמן שהמנועים פועלים המהירות גדלה באופן קבוע. מה התאוצה?",
      ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "a = ?", 16, 30) },
    { to: (m) => m.events.burnout, pace: 3, caption: "באיזה גובה נמצא הטיל ברגע שהדלק נגמר?",
      ask: (P, m, t) => { if (t >= m.events.burnout - 1e-9) askSpan(P, 0, 0, m.state(t).b.x, "h = ?", -40); } },
    { to: (m) => m.events.turn0, pace: 6, caption: "הטיל עולה עד שהמהירות שלו מתאפסת. מה הגובה המרבי?",
      ask: (P, m, t) => { if (t >= m.events.turn0 - 1e-9) askSpan(P, 0, 0, m.values["x@turn0"], "H = ?", -40); flash(P, t, m.events.burnout, 0, 1500, "הדלק נגמר", 8); } },
    { to: (m) => m.events.hit, pace: 9, hideClock: true, caption: "מהשיגור, דרך הגובה המרבי, ועד שהטיל חוזר אל פני הכוכב. כמה זמן נמשכת כל התנועה?",
      ask: (P, m, t) => { if (t >= m.events.hit - 1e-9) askLabel(P, 0, 0, "t = ?", 18, -30); } },
    { from: (m) => m.events.turn0, to: (m) => m.events.hit, pace: 6, caption: "מהגובה המרבי הטיל נופל רק בהשפעת הכובד. באיזו מהירות הוא פוגע בפני הכוכב?",
      ask: (P, m, t) => { if (t >= m.events.hit - 1e-9) askLabel(P, 0, 0, "v = ?", 18, -40); } },
  ],
});
