import { body, type Phase, type State, type Story } from "../engine";
import { storySpec } from "../kits";

/**
 * 1982c q1: a sled slides from M down a slope with friction, then along the flat until it stops at A.
 * Drawn: a 4 m slope at 35°, μ = 0.2. Experiment 2 (5 people): the window stops when it reaches the flat, since where it stops is asked.
 */
const g = 10, th = (35 * Math.PI) / 180, L = 4, mu = 0.2;
const aS = g * (Math.sin(th) - mu * Math.cos(th));
const top = L * Math.sin(th), foot = L * Math.cos(th);
const story = (mass: number): Story => ({
  init: { b: body(0, top, 0, 0) },
  phases: [
    {
      end: "foot",
      acc: { b: [aS * Math.cos(th), -aS * Math.sin(th)] as [number, number] },
      dur: () => Math.sqrt((2 * L) / aS),
      // build 2: weight, normal force and kinetic friction as vectors, divided by the mass
      force: (s: State) => {
        const W: [number, number] = [0, -mass * g], N = mass * g * Math.cos(th), n: [number, number] = [Math.sin(th), Math.cos(th)];
        const v = Math.hypot(s.b.vx, s.b.vy) || 1, f = mu * N;
        return { b: [(W[0] + N * n[0] - (f * s.b.vx) / v) / mass, (W[1] + N * n[1] - (f * s.b.vy) / v) / mass] as [number, number] };
      },
      until: (s: State) => s.b.y <= 0,
      // the sled turns onto the flat keeping its speed
      jump: (s: State) => { s.b.vx = Math.hypot(s.b.vx, s.b.vy); s.b.vy = 0; s.b.y = 0; },
    },
    {
      end: "stop",
      acc: { b: [-mu * g, 0] as [number, number] },
      dur: (s: State) => s.b.vx / (mu * g),
      force: () => ({ b: [(-mu * mass * g) / mass, 0] as [number, number] }),
      until: (s: State) => s.b.vx <= 0,
      jump: (s: State) => { s.b.vx = 0; },
    },
  ] satisfies Phase[],
  record: { xA: ["stop", (s: State) => s.b.x] },
});
export const spec = storySpec({
  id: "bagrut-1982c-q1",
  view: { x0: -0.6, x1: 13, y0: -0.8, y1: 3.4 },
  scale: 12,
  scenarios: { one: story(80), five: story(400) },
  order: { one: ["foot", "stop"], five: ["foot", "stop"] },
  answers: { "one.xA": [foot + (aS * L) / (mu * g), 1e-6] },
  parts: [
    { to: (m) => m.events["one.stop"] + m.events["five.foot"], pace: 0.8, caption: "ניסוי 1: אדם אחד, המזחלת נעצרת ב-A. ניסוי 2: חמישה אנשים, מאותה נקודה M. איפה תיעצר המזחלת?" },
  ],
  draw: (P, m, t) => {
    P.poly([[0, top], [foot, 0], [0, 0]]);
    P.ground(0, -0.5, 12.8);
    P.mono(0, top, "M", { tone: "data", size: 13, dxPx: -12 });
    const t1 = m.events["one.stop"];
    const xA = m.state(t1)["one.b"].x;
    P.line(xA, 0, xA, -0.3, { tone: "data", w: 1.2 }); P.mono(xA, -0.3, "A", { tone: "data", size: 13, dyPx: 14 });
    const draw1 = (b: { x: number; y: number }, label: string, tone: "body" | "b2") => {
      const onSlope = b.y > 1e-6;
      P.block(b.x, b.y, { wPx: 30, hPx: 14, angle: onSlope ? -th : 0, tone, label });
    };
    if (t <= t1) draw1(m.state(t)["one.b"], "1", "body");
    else {
      const b2 = m.state(t - t1)["five.b"];
      draw1(b2, "5", "b2");
      if (t - t1 >= m.events["five.foot"] - 1e-9) P.heb(b2.x + 1.5, 1.2, "איפה תיעצר?", { tone: "ask", size: 14 });
    }
  },
});
