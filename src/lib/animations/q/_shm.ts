import { body, simulate, type AnimSpec, type Model, type Painter, type State } from "../engine";
import { askLabel } from "../kits";

/**
 * A mass on a spring released from rest at displacement A (from equilibrium; + is right, or up when vertical).
 * Build 1: x = A·cos(ωt), ω = √(k/m). Build 2: the spring's restoring force −k·x, step by step (for a vertical spring
 * the weight is balanced at equilibrium, so the net force is still −k·x).
 * Events: eq1, eq2… when it passes equilibrium; turn1, turn2… when it stops for a moment (after the start).
 */
type Ask = { caption: string; ask?: string; at?: "body" | "eq" | "top" | "spring"; until?: number; from?: number; clock?: boolean };
export function shmSpec(o: {
  id: string; k: number; m: number; A: number; vertical?: boolean; periods?: number; L0?: number;
  /** Start at equilibrium moving with the full speed (x = A·sin ωt) instead of at rest at A. */
  fromEq?: boolean;
  /** Vertical, with the springs below the body (a board on springs). */
  below?: boolean;
  parts: Ask[]; answers?: AnimSpec["answers"]; extra?: (P: Painter, x: number, t: number, part: number) => void; size?: number;
}): AnimSpec {
  const w = Math.sqrt(o.k / o.m), T = (2 * Math.PI) / w, n = Math.round((o.periods ?? 1.5) * 4);
  const L0 = o.L0 ?? Math.max(3 * Math.abs(o.A), 0.3);
  const ev: string[] = [];
  const eqFirst = !o.fromEq;
  for (let i = 1; i <= n; i++) ev.push((i % 2 === 1) === eqFirst ? `eq${Math.ceil(i / 2)}` : `turn${Math.ceil(i / 2)}`);
  const X = (t: number) => (o.fromEq ? o.A * Math.sin(w * t) : o.A * Math.cos(w * t));
  const V = (t: number) => (o.fromEq ? o.A * w * Math.cos(w * t) : -o.A * w * Math.sin(w * t));
  const tEnd = (n * T) / 4;
  const formula = (): Model => {
    const events: Record<string, number> = {};
    ev.forEach((e, i) => (events[e] = ((i + 1) * T) / 4));
    return {
      state: (tq: number): State => { const t = Math.min(Math.max(tq, 0), tEnd); return { b: body(X(t), 0, V(t), 0) }; },
      events,
      values: { T, vmax: Math.abs(o.A) * w, amax: Math.abs(o.A) * w * w },
    };
  };
  const simulation = (): Model => {
    let px = X(0), pv = V(0), eq = 0, tu = 0, vmax = 0, lastEq = o.fromEq ? 0 : -T, lastTu = o.fromEq ? -T : 0;
    const res = simulate({
      init: { b: body(X(0), 0, V(0), 0) },
      accel: (s) => { px = s.b.x; pv = s.b.vx; vmax = Math.max(vmax, Math.abs(pv)); return { b: { ax: (-o.k * s.b.x) / o.m, ay: 0 } }; },
      events: ev.map((e, i) => ({
        name: e,
        when: (s: State, t: number) => {
          // one crossing is one event: the next one of the same kind needs a later crossing (half a period on)
          if (e.startsWith("eq")) { const hit = px * s.b.x <= 0 && t > lastEq + T / 4 && eq === Number(e.slice(2)) - 1; if (hit) { eq++; lastEq = t; } return hit; }
          const hit = pv * s.b.vx <= 0 && t > lastTu + T / 4 && tu === Number(e.slice(4)) - 1; if (hit) { tu++; lastTu = t; } return hit;
        },
        stop: i === ev.length - 1,
      })),
      tMax: tEnd * 1.05,
      dt: T / 2e5,
    });
    res.model.values.T = 2 * (res.model.events.eq2 - res.model.events.eq1);
    res.model.values.vmax = vmax;
    res.model.values.amax = (o.k * Math.abs(o.A)) / o.m;
    return res.model;
  };
  const S = o.size ?? 1;
  return {
    id: o.id,
    view: o.vertical ? { x0: -2 * (L0 + 2 * Math.abs(o.A)), x1: 2 * (L0 + 2 * Math.abs(o.A)), y0: -(L0 + 2 * Math.abs(o.A)) * 1.5, y1: (L0 + 2 * Math.abs(o.A)) * 0.5 } : { x0: -0.15 * L0, x1: 2.2 * L0 + 2 * Math.abs(o.A), y0: -0.3 * L0, y1: 0.8 * L0 },
    formula,
    simulation,
    order: ev,
    scale: Math.abs(o.A) * 2,
    answers: o.answers,
    parts: o.parts.map((p) => ({ from: p.from !== undefined ? () => p.from! * T : undefined, to: () => (p.until ?? (o.periods ?? 1.5)) * T, pace: Math.max(1, 3 / T), hideClock: !(p.clock ?? true), caption: p.caption })),
    draw: (P, m, t, part) => {
      const x = m.state(t).b.x;
      if (o.vertical) {
        const top = (L0 + 2 * Math.abs(o.A)) * 0.4;
        const y = -L0 + x;
        if (o.below) { const fl = -L0 - L0 * 0.9; P.ground(fl, -L0 * 0.8, L0 * 0.8); for (const dx of [-0.5, 0, 0.5]) P.spring(dx * L0, fl, dx * L0, y - 0.06 * L0, { coils: 7, ampPx: 6 }); P.block(0, y, { wPx: 150, hPx: 10, base: false, tone: "b2" }); }
        else { P.line(-L0 * 0.5, top, L0 * 0.5, top, { tone: "line", w: 3 }); P.spring(0, top, 0, y + 0.06 * L0, { coils: 10, ampPx: 8 }); }
        if (!o.below) P.block(0, y, { wPx: 34 * S, hPx: 30 * S, base: false });
        P.line(-L0 * 0.4, -L0, -L0 * 0.25, -L0, { tone: "idle", w: 1, dash: "3 3" }); P.mono(-L0 * 0.42, -L0, "O", { tone: "data", size: 11, anchor: "end" });
        if (Math.abs(m.state(t).b.vx) > 1e-6) P.arrowPx(L0 * 0.3, y, 0, -Math.sign(m.state(t).b.vx) * Math.min(50, 8 + 42 * Math.abs(m.state(t).b.vx) / (Math.abs(o.A) * w)), { tone: "vel", label: "v" });
        o.extra?.(P, y, t, part);
        const a = o.parts[part]; if (a?.ask) askLabel(P, a.at === "eq" ? 0 : 0, a.at === "eq" ? -L0 : y, a.ask, 30, a.at === "eq" ? 0 : -10);
      } else {
        P.wall(0, -0.1 * L0, 0.5 * L0, "left");
        P.line(0, 0, 2.2 * L0 + 2 * Math.abs(o.A), 0, { tone: "line", w: 2 });
        const bx = L0 + x;
        P.spring(0, 0.12 * L0, bx - 0.1 * L0, 0.12 * L0, { coils: 10, ampPx: 7 });
        P.block(bx, 0, { wPx: 36 * S, hPx: 28 * S });
        P.line(L0, -0.05 * L0, L0, -0.2 * L0, { tone: "idle", w: 1, dash: "3 3" }); P.mono(L0, -0.2 * L0, "O", { tone: "data", size: 11, dyPx: 12 });
        const v = m.state(t).b.vx;
        if (Math.abs(v) > 1e-6) P.arrowPx(bx, 0.5 * L0, Math.sign(v) * Math.min(60, 8 + 52 * Math.abs(v) / (Math.abs(o.A) * w)), 0, { tone: "vel", label: "v" });
        o.extra?.(P, bx, t, part);
        const a = o.parts[part]; if (a?.ask) askLabel(P, a.at === "eq" ? L0 : bx, 0.25 * L0, a.ask, 0, -30);
      }
    },
  };
}
