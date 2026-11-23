import { body } from "../engine";
import { askLabel, storySpec } from "../kits";

/**
 * 1983c q2: a 200 g body on two identical springs side by side stretches each by 1 cm (k = 100 N/m).
 * Story: a hand lowers the body slowly (1 cm/s) until the springs hold it. Figure 2: the springs one below the other.
 * The part asks for figure 2, so its window ends when figure 1 hangs free, while figure 2 is still held.
 */
const m = 0.2, g = 10, k = 100, u = 0.01, L0 = 0.06, top = 0.13;
export const spec = storySpec({
  id: "bagrut-1983c-q2",
  view: { x0: -0.16, x1: 0.16, y0: -0.05, y1: 0.15 },
  scale: 0.05,
  scenarios: {
    side: {
      init: { b: body(0.08, 0, 0, -u) },
      phases: [{ end: "free", acc: {}, dur: () => (m * g) / (2 * k) / u, force: () => ({}), until: (s) => 2 * k * -s.b.y >= m * g, jump: (s) => { s.b.vy = 0; } }],
      record: { x: ["free", (s) => -s.b.y] },
    },
    below: {
      init: { b: body(-0.08, 0, 0, -u) },
      phases: [{ end: "free", acc: {}, dur: () => (2 * m * g) / k / u, force: () => ({}), until: (s) => k * (-s.b.y / 2) >= m * g, jump: (s) => { s.b.vy = 0; } }],
    },
  },
  order: { side: ["free"], below: ["free"] },
  answers: { "side.x": [0.01, 1e-9] },
  parts: [
    { to: (mm) => mm.events["side.free"], pace: 2, caption: "יד מורידה לאט את שני הגופים. בתרשים 1 כל קפיץ מתארך ב-1 ס\"מ כשהגוף תלוי חופשי. כמה יתארך כל קפיץ בתרשים 2?" },
  ],
  draw: (P, mm, t) => {
    const s = mm.state(t);
    P.line(-0.15, top, 0.15, top, { tone: "line", w: 3 });
    // figure 1: two springs side by side
    const y1 = s["side.b"].y;
    for (const dx of [-0.012, 0.012]) P.spring(0.08 + dx, top, 0.08 + dx, top - L0 + y1, { coils: 8, ampPx: 6 });
    P.block(0.08, top - L0 + y1, { wPx: 60, hPx: 22, base: false, label: "200 g" });
    if (t < mm.events["side.free"] - 1e-9) P.line(0.05, top - L0 + y1 - 0.012, 0.11, top - L0 + y1 - 0.012, { tone: "runner", w: 4 });
    P.heb(0.08, -0.04, "תרשים 1", { tone: "text", size: 12 });
    // figure 2: one spring below the other
    const y2 = s["below.b"].y;
    const mid = top - L0 + y2 / 2;
    P.spring(-0.08, top, -0.08, mid, { coils: 8, ampPx: 6 });
    P.spring(-0.08, mid, -0.08, mid - L0 + y2 / 2, { coils: 8, ampPx: 6 });
    const yb = top - 2 * L0 + y2;
    P.block(-0.08, yb, { wPx: 60, hPx: 22, base: false, label: "200 g" });
    P.line(-0.11, yb - 0.012, -0.05, yb - 0.012, { tone: "runner", w: 4 });
    P.heb(-0.08, -0.04, "תרשים 2", { tone: "text", size: 12 });
    if (t >= mm.events["side.free"] - 1e-9) { P.mono(0.08, top - L0 + y1, "1 cm", { tone: "data", size: 11, dxPx: 44, anchor: "start" }); askLabel(P, -0.08, mid, "Δx = ?", 26, 0); }
  },
});
