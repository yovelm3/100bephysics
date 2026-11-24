import { body } from "../engine";
import { askLabel, askWidth, fallPhase, storySpec } from "../kits";

/** 1986 q4: a ball let go 20 cm above the table on a smooth track that ends level at the table's edge (80 cm high): 2 m/s at the edge. The story starts there. */
const g = 10, h = 0.2, H = 0.8;
export const spec = storySpec({
  id: "bagrut-1986-q4",
  view: { x0: -1.0, x1: 1.4, y0: -0.1, y1: 1.1 },
  scale: 1,
  story: { init: { b: body(0, H, Math.sqrt(2 * g * h), 0) }, phases: [fallPhase({ end: "land", body: "b", toY: 0 })], record: { d: ["land", (s) => s.b.x], v: ["land", (s) => Math.hypot(s.b.vx, s.b.vy)] } },
  order: ["land"],
  answers: { d: [0.8, 1e-9], v: [4.47213595499958, 1e-9] },
  parts: [
    { to: (m) => m.events.land, pace: 2.5, caption: "הכדור יורד מ-A, 20 ס\"מ מעל השולחן, ועוזב את המסילה בקצה השולחן. באיזה מרחק אופקי הוא פוגע ברצפה?" },
    { to: (m) => m.events.land, pace: 2.5, caption: "מה גודל המהירות שבה הכדור פוגע ברצפה?" },
    { to: (m) => m.events.land, pace: 2.5, caption: "על המאדים: מאיזה גובה צריך לשחרר את הכדור כדי שיפגע באותו מרחק?" },
  ],
  draw: (P, m, t, part) => {
    P.ground(0, -0.95, 1.35);
    P.poly([[-0.9, 0], [0, 0], [0, H - 0.01], [-0.9, H - 0.01]]);
    P.poly([[-0.75, H + h], [-0.5, H + 0.02], [0, H + 0.01]], { close: false, fill: "none", tone: "line", w: 2.4 });
    P.mono(-0.75, H + h, "A", { tone: "data", size: 12, dxPx: -10 });
    const b = m.state(t).b, landed = t >= m.events.land - 1e-9;
    P.circle(b.x, b.y + 0.02, 6, { fill: "body" });
    if (part === 0 && landed) askWidth(P, 0, b.x, 0, "d = ?", 30);
    if (part === 1 && landed) askLabel(P, b.x, 0, "v = ?", 16, -30);
    if (part === 2) askLabel(P, -0.75, H + h, "h = ?", 20, 0);
  },
});
