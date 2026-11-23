import { graphMotion } from "../kits";

/** 1980 winter q2: a body moves by the velocity-time graph: fast, a sharp slow-down in 0.002 s, then slower. */
export const spec = graphMotion({
  id: "bagrut-1980w-q2",
  v: [[0, 500], [0.02, 500], [0.022, 100], [0.03, 100]],
  names: ["start", "brakeStart", "brakeEnd", "end"],
  range: [0, 11.6],
  graph: { vMin: 0, vMax: 550 },
  answers: { "a@0": [0, 1e-9], "a@1": [-200000, 1], "a@2": [0, 1e-9] },
  parts: [
    { to: (m) => m.events.end, pace: 120, caption: "הגוף נע לפי הגרף: מהירות קבועה, עצירה חדה בזמן קצר מאוד, ושוב מהירות קבועה. איזה סיפור מתאים לזה?" },
    {
      to: (m) => m.events.end,
      pace: 120,
      caption: "בכל שלב: האם המהירות משתנה? מה גודל הכוח השקול בכל אחד משלושת השלבים?",
      ask: (P, m, t) => {
        const s = m.state(t).b;
        P.mono(s.x, 1.6, "ΣF = ?", { tone: "ask", size: 14, weight: 700 });
      },
    },
  ],
});
