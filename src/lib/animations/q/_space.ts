import type { AnimSpec, Painter, PartAnim } from "../engine";
import { askLabel, radialMotion, spinMotion } from "../kits";

/** Shared builders for the gravitation questions: a satellite in a circular orbit, and radial motion near a planet. */

type Ask = { caption: string; ask?: string; at?: "sat" | "center" | "orbit" | "planet"; until?: number; from?: number; clock?: boolean };
export const disk = (P: Painter, x: number, y: number, r: number, tone: "b2" | "body" | "soft" = "b2") =>
  P.poly(Array.from({ length: 64 }, (_, i) => { const a = (2 * Math.PI * i) / 64; return [x + r * Math.cos(a), y + r * Math.sin(a)] as [number, number]; }), { tone, fill: tone === "soft" ? "soft" : "none", w: 2 });

/**
 * A satellite in a circular orbit of radius r around a planet of radius R, with GM given (period from Kepler/Newton).
 * Parts: a caption, an orange label (never a value) at the satellite, the center, the orbit or the planet, and the
 * window: until/from in laps. The clock is hidden unless asked (orbit times are often what is asked).
 */
export function orbitSpec(o: { id: string; R: number; r: number; gm: number; span?: number; laps?: number; parts: Ask[]; extra?: (P: Painter, c: { x: number; z: number; vx: number; vz: number }, t: number, part: number) => void; showA?: boolean; answers?: AnimSpec["answers"] }): AnimSpec {
  const T = 2 * Math.PI * Math.sqrt(o.r ** 3 / o.gm), laps = o.laps ?? 1, span = Math.max(o.r, o.R, o.span ?? 0) * 1.25;
  const parts: PartAnim[] = o.parts.map((p) => ({
    from: p.from ? () => p.from! * T : undefined,
    to: () => (p.until ?? laps) * T,
    pace: 8 / T,
    hideClock: !p.clock,
    caption: p.caption,
  }));
  return spinMotion({
    id: o.id, r: o.r, period: T, laps, gm: o.gm, answers: o.answers,
    view: { x0: -span * 1.6, x1: span * 1.6, y0: -span, y1: span },
    parts,
    draw: (P, c, _m, t, part) => {
      disk(P, 0, 0, o.R);
      P.ring(0, 0, o.r, { tone: "idle", w: 1, dash: "5 5" });
      P.circle(c.x, c.z, 6, { fill: "body" });
      const vs = 50 / Math.hypot(c.vx, c.vz);
      P.arrowPx(c.x, c.z, c.vx * vs, -c.vz * vs, { tone: "vel", label: "v" });
      if (o.showA) P.arrowPx(c.x, c.z, (-c.x / o.r) * 40, (c.z / o.r) * 40, { tone: "force", label: "a" });
      o.extra?.(P, c, t, part);
      const a = o.parts[part];
      if (a?.ask) {
        if (a.at === "center") askLabel(P, 0, 0, a.ask, 0, -10);
        else if (a.at === "planet") askLabel(P, 0, o.R, a.ask, 0, -14);
        else if (a.at === "orbit") askLabel(P, -o.r * 0.71, o.r * 0.71, a.ask, -20, -10);
        else askLabel(P, c.x, c.z, a.ask, 16, -16);
      }
    },
  });
}

/**
 * Radial motion above a planet of radius R: from r0 with v0 (+ up) to r1. Drawn as a column above the planet's top;
 * the label of each part sits at the body (or at the planet).
 */
export function radialSpec(o: { id: string; R: number; gm: number; r0: number; v0: number; r1: number; gm2?: number; d?: number; dt?: number; points?: Record<string, number>; parts: Ask[]; answers?: AnimSpec["answers"]; extra?: (P: Painter, y: number, t: number, part: number) => void }): AnimSpec {
  const run = radialMotion({ gm: o.gm, r0: o.r0, v0: o.v0, r1: o.r1, points: o.points, gm2: o.gm2, d: o.d, dt: o.dt });
  const T = run.T(), top = Math.max(o.r0, o.r1);
  const ev = Object.entries(o.points ?? {}).sort((a, b) => (a[1] - b[1]) * Math.sign(o.r1 - o.r0)).map(([n]) => n);
  return {
    id: o.id,
    view: { x0: -(top - o.R) * 1.1, x1: (top - o.R) * 1.1, y0: -(top - o.R) * 0.12, y1: (top - o.R) },
    formula: run.formula,
    simulation: run.simulation,
    order: [...ev, "end"],
    scale: Math.abs(o.r1 - o.r0),
    tolTime: T * 1e-3,
    relTol: 2e-3,
    answers: o.answers,
    parts: o.parts.map((p) => ({ from: p.from ? () => p.from! * T : undefined, to: () => (p.until ?? 1) * T, pace: 8 / T, hideClock: !p.clock, caption: p.caption })),
    draw: (P, m, t, part) => {
      // the planet seen from the side: its top arc, the center below the picture
      P.poly(Array.from({ length: 81 }, (_, i) => { const a = Math.PI / 2 + ((i - 40) / 40) * 0.9; return [o.R * Math.cos(a), o.R * Math.sin(a) - o.R] as [number, number]; }), { close: false, fill: "none", tone: "b2", w: 3 });
      const y = m.state(t).b.y - o.R; // height above the surface (the surface's top is at y = 0)
      P.circle(0, y, 6, { fill: "body" });
      const vy = m.state(t).b.vy;
      if (Math.abs(vy) > 1e-9) P.arrowPx(0, y, 0, -Math.sign(vy) * Math.min(60, 12 + 48 * Math.abs(vy) / Math.max(1e-9, Math.abs(o.v0) + Math.sqrt(2 * o.gm / o.R))), { tone: "vel", label: "v" });
      o.extra?.(P, y, t, part);
      const a = o.parts[part];
      if (a?.ask) { if (a.at === "planet") askLabel(P, 0, 0, a.ask, 20, 20); else askLabel(P, 0, y, a.ask, 20, -10); }
    },
  };
}
