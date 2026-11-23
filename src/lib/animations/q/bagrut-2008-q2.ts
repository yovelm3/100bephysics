import { askLabel, graphMotion } from "../kits";

/** 2008 q2: an elevator's velocity graph: up to 1 m/s in 2 s, steady until 8 s, slowing to rest at 12 s (9 m). A 5 kg melon on a spring scale inside. */
export const spec = graphMotion({
  id: "bagrut-2008-q2",
  vertical: true,
  shape: "elevator",
  v: [[0, 0], [2, 1], [8, 1], [12, 0]],
  names: ["start", "c1", "c2", "top"],
  range: [0, 10],
  graph: { vMin: 0, vMax: 1.2, tTicks: [2, 8, 12], vTicks: [0.5, 1] },
  answers: { "x@top": [9, 1e-9], "a@0": [0.5, 1e-9], "a@2": [-0.25, 1e-9] },
  parts: [
    { to: (m) => m.events.top, pace: 0.4, caption: "המעלית עולה מקומת הקרקע. מה הגובה של הקומה העליונה?", ask: (P, m, t) => { if (t >= m.events.top - 1e-9) askLabel(P, 0, m.state(t).b.x, "h = ?", 30, 0); } },
    { to: (m) => m.events.top, pace: 0.4, caption: "אבטיח של 5 ק\"ג תלוי על דינמומטר במעלית. מה מראה הדינמומטר בכל אחד משלושת פרקי הזמן?", ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "F = ?", 30, 0) },
    { to: (m) => m.events.top, pace: 0.4, caption: "אילו הכבל היה נקרע והמעלית נופלת חופשית: מה היה מראה הדינמומטר?", ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "F = ?", 30, 0) },
    { to: () => 2, pace: 0.4, caption: "צופה על הקרקע שוקל אבטיח זהה ומקבל משקל אחר. איך מסבירים את ההבדל?", ask: (P, m, t) => askLabel(P, 0, m.state(t).b.x, "?", 30, 0) },
  ],
});
