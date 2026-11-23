import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 2009 q2: A (3 kg) and B (2 kg) touch on a rough floor (μk = 0.1); F = 13 N pushes A for a few seconds (drawn: 3 s).
 * Parts ג and ד ask what happens after F stops, so their windows end when it stops. Figure ב: B glued on top of A.
 */
const g = 10, mA = 3, mB = 2, F = 13, mu = 0.1, tF = 3;
const a = (F - mu * (mA + mB) * g) / (mA + mB);
export const spec = storySpec({
  id: "bagrut-2009-q2",
  view: { x0: -1.2, x1: 11.2, y0: -0.6, y1: 4.4 },
  scale: 8,
  scenarios: {
    side: {
      init: { A: body(0, 0, 0, 0), B: body(1.1, 0, 0, 0) },
      // build 2: A: F − N − fA = mA·a ; B: N − fB = mB·a, with the contact force N between them
      phases: [{ end: "Foff", acc: { A: [a, 0], B: [a, 0] }, dur: () => tF, force: () => { const N = mB * (F - mu * (mA + mB) * g) / (mA + mB) + mu * mB * g; return { A: [(F - N - mu * mA * g) / mA, 0], B: [(N - mu * mB * g) / mB, 0] }; }, until: (_s, t) => t >= tF - 1e-12 }],
      record: { N: ["Foff", (s) => mB * (s.B.vx / tF) + mu * mB * g] },
    },
    glued: {
      init: { A: body(0, 2.4, 0, 0) },
      phases: [{ end: "Foff", acc: { A: [a, 0] }, dur: () => tF, force: () => ({ A: [(F - mu * (mA + mB) * g) / (mA + mB), 0] }), until: (_s, t) => t >= tF - 1e-12 }],
    },
  },
  order: { side: ["Foff"], glued: ["Foff"] },
  answers: { "side.N": [5.2, 1e-9] },
  parts: [
    { to: () => tF, pace: 0.8, caption: "F דוחף את A, ו-A דוחף את B. האם הכוח של A על B גדול מהכוח של B על A, קטן ממנו או שווה לו?" },
    { to: () => tF, pace: 0.8, caption: "mB = 2 kg, mA = 3 kg, F = 13 N, μ = 0.1. מה הכוח ש-A מפעיל על B?" },
    { to: () => tF, pace: 0.8, caption: "הכוח F מפסיק לפעול. מה הכוח ש-A מפעיל על B אחרי זה?" },
    { to: () => tF, pace: 0.8, caption: "מה קורה אחרי שהכוח מפסיק: הגופים נעצרים מיד, נעצרים יחד, או ש-A נעצר לפני B?" },
    { to: () => tF, pace: 0.8, caption: "עכשיו B מודבק על A, ואותו כוח פועל. האם התאוצה גדולה, שווה או קטנה מקודם?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -1.1, 11.1);
    const s = m.state(t);
    if (part === 4) {
      const A = s["glued.A"];
      P.ground(2.4, -1.1, 11.1);
      P.block(A.x + 0.5, 2.4, { wPx: 52, hPx: 34, label: "A" });
      P.block(A.x + 0.5, 2.4 + 0.64, { wPx: 40, hPx: 28, label: "B", tone: "b2" });
      if (t < tF) P.arrowPx(A.x - 0.9, 2.72, 40, 0, { tone: "force", label: "F" });
      askLabel(P, A.x + 0.5, 3.4, "a ?", 30, -10);
    }
    const A = s["side.A"], B = s["side.B"];
    P.block(A.x + 0.5, 0, { wPx: 52, hPx: 34, label: "A" });
    P.block(B.x + 0.5, 0, { wPx: 40, hPx: 28, label: "B", tone: "b2" });
    if (t < tF - 1e-9) P.arrowPx(A.x - 0.9, 0.3, 40, 0, { tone: "force", label: "F" });
    if (A.vx > 0.05) P.arrowPx(A.x + 0.8, 1.2, A.vx * 14, 0, { tone: "vel", label: "v" });
    if (part === 0) askLabel(P, B.x + 0.05, 0.3, "F(AB) ? F(BA)", 0, -50);
    if (part === 1) askLabel(P, B.x + 0.05, 0.3, "F(AB) = ?", 0, -50);
    if (part === 2 && t >= tF - 1e-9) askLabel(P, B.x + 0.05, 0.3, "F(AB) = ?", 0, -50);
    if (part === 3 && t >= tF - 1e-9) askLabel(P, B.x + 0.05, 0.3, "?", 0, -50);
  },
});
