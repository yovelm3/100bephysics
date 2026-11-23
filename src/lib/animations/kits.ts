/**
 * Ready-made kinds of animated figures, built on the engine. Each still builds the story twice and is compared.
 */
import { body, simulate, type AnimSpec, type Model, type Painter, type PartAnim, type State } from "./engine";

// ───────────── motion along a line, given by a velocity-time graph ─────────────

export type GraphMotion = {
  id: string;
  /** Corners of the velocity-time graph (straight lines between them). */
  v: [number, number][];
  /** Starting position along the line. */
  x0?: number;
  /** Vertical motion (a rocket, an elevator) or horizontal (default). */
  vertical?: boolean;
  /** Names for the corners (events), in order; a corner without a name is called c1, c2… */
  names?: string[];
  /** Values to check against the exercise answers: name → [answer, tolerance]. Names: x@event, xmax, xmin, v@event, a@segment index. */
  answers?: Record<string, [number, number]>;
  /** Drawing window of the line, in meters. */
  range: [number, number];
  /** tTicks/vTicks: only numbers printed on the original graph (never computed ones). ghost: the graph line as printed. */
  graph: { vMin: number; vMax: number; yLabel?: string; tTicks?: number[]; vTicks?: number[]; ghost?: [number, number][] };
  /** graphT: the time window of the graph panel in this part (to zoom on the start). */
  parts: (PartAnim & { ask?: (P: Painter, m: Model, t: number) => void; graphT?: number })[];
  /** Which graph the question gives: velocity (default) or acceleration (steps). */
  panel?: "v" | "a" | "x" | "none";
  /** Position-time graph panel (when the question gives x(t)): window and range in meters. */
  xGraph?: { xMin: number; xMax: number; label?: string; tTicks?: number[]; xTicks?: [number, string][] };
  /** Marks of the body's place every `every` seconds, like a strobe photo or a measurement table. */
  strobe?: { every: number; labelEvery?: number };
  /** Body shape. */
  shape?: "block" | "rocket" | "elevator" | "cart" | "ball";
  /** Extra drawing on top (data labels…). */
  extra?: (P: Painter, m: Model, t: number, part: number) => void;
  /** Marks on the line: [x, label]. */
  marks?: [number, string][];
};

export function graphMotion(g: GraphMotion): AnimSpec {
  const pts = g.v;
  const T = pts[pts.length - 1][0];
  const names = pts.map((_, i) => g.names?.[i] ?? `c${i}`);
  const slope = (i: number) => (pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]);
  const seg = (t: number) => { let i = 0; while (i < pts.length - 2 && t >= pts[i + 1][0]) i++; return i; };

  // build 1: positions from the areas under the graph (closed form, segment by segment)
  const formula = (): Model => {
    const x: number[] = [g.x0 ?? 0];
    for (let i = 0; i < pts.length - 1; i++) {
      const dt = pts[i + 1][0] - pts[i][0];
      x.push(x[i] + ((pts[i][1] + pts[i + 1][1]) / 2) * dt);
    }
    const at = (t: number) => {
      const tt = Math.min(Math.max(t, 0), T), i = seg(tt), u = tt - pts[i][0], a = slope(i);
      return { x: x[i] + pts[i][1] * u + 0.5 * a * u * u, v: pts[i][1] + a * u, a };
    };
    const events: Record<string, number> = {};
    const values: Record<string, number> = {};
    pts.forEach(([t], i) => { events[names[i]] = t; values[`x@${names[i]}`] = x[i]; values[`v@${names[i]}`] = pts[i][1]; });
    // turning points: where the velocity changes sign (inside a segment, or at a corner where it is exactly zero)
    const turns: number[] = [];
    // sign of the velocity just before/after each corner, skipping parts where it stays at zero
    for (let i = 0; i < pts.length - 1; i++) {
      const [t1, v1] = pts[i], [t2, v2] = pts[i + 1];
      if (v1 * v2 < 0) turns.push(t1 + (-v1 / (v2 - v1)) * (t2 - t1));
      if (v2 === 0 && v1 !== 0) {
        let j = i + 1;
        while (j < pts.length - 1 && pts[j + 1][1] === 0) j++;
        const after = j < pts.length - 1 ? pts[j + 1][1] : 0;
        if (v1 * after < 0) turns.push(t2);
      }
    }
    turns.sort((p, q) => p - q).forEach((tz, k) => { events[`turn${k}`] = tz; values[`x@turn${k}`] = at(tz).x; });
    for (let i = 0; i < pts.length - 1; i++) values[`a@${i}`] = slope(i);
    const xs = [...pts.map((_, i) => x[i]), ...Object.keys(values).filter((n) => n.startsWith("x@turn")).map((n) => values[n])];
    values.xmax = Math.max(...xs); values.xmin = Math.min(...xs);
    const state = (t: number): State => { const s = at(t); return { b: body(s.x, 0, s.v, 0, { a: s.a }) }; };
    return { state, events, values };
  };

  // build 2: the acceleration in each segment is the slope; integrate step by step, detect turning points from the velocity
  const simulation = (): Model => {
    let turns = 0;
    const xs: number[] = [];
    const values: Record<string, number> = {};
    const evs = pts.map(([tc], i) => ({
      name: names[i],
      when: (_s: State, t: number) => t >= tc - 1e-9,
      then: (s: State) => { values[`x@${names[i]}`] = s.b.x; values[`v@${names[i]}`] = s.b.vx; xs.push(s.b.x); },
      stop: i === pts.length - 1,
    }));
    let lastV = pts[0][1];
    let zeroSince = -1;
    const turn = {
      name: "turn-detector",
      when: (s: State, t: number) => {
        const v = s.b.vx, eps = 1e-6 * Math.max(...pts.map(([, pv]) => Math.abs(pv)));
        if (Math.abs(v) < eps) { if (zeroSince < 0) zeroSince = t; return false; }
        if (lastV * v < 0) { values[`x@turn${turns}`] = s.b.x; xs.push(s.b.x); turnTimes.push(zeroSince >= 0 ? zeroSince : t); turns++; }
        lastV = v; zeroSince = -1;
        return false;
      },
    };
    const turnTimes: number[] = [];
    const dt = T / 1e6;
    const res = simulate({
      init: { b: body(g.x0 ?? 0, 0, pts[0][1], 0) },
      accel: (_s, t) => {
        // the average of the graph's slope over the step, so a step across a corner keeps the velocity exact
        const i = seg(t), tb = pts[i + 1]?.[0] ?? Infinity;
        const a = t + dt <= tb || i >= pts.length - 2 ? slope(i) : (slope(i) * (tb - t) + slope(i + 1) * (t + dt - tb)) / dt;
        return { b: { ax: a, ay: 0 } };
      },
      events: [...evs, turn],
      tMax: T + dt,
      dt,
    });
    const m = res.model;
    delete m.events["turn-detector"];
    turnTimes.forEach((tz, i) => (m.events[`turn${i}`] = tz));
    for (let i = 0; i < pts.length - 1; i++) values[`a@${i}`] = (pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]);
    values.xmax = Math.max(...xs); values.xmin = Math.min(...xs);
    Object.assign(m.values, values);
    const st = m.state;
    m.state = (t) => { const s = st(t); s.b.a = slope(seg(Math.min(t, T - 1e-12))); return s; };
    return m;
  };

  const order: (string | string[])[] = (() => {
    const f = formula();
    return Object.entries(f.events).sort((a, b) => a[1] - b[1]).map(([n]) => n);
  })();

  const [r0, r1] = g.range;
  const span = r1 - r0;
  const vert = !!g.vertical;
  // horizontal: graph on top (y 22–172 px), the line at y 300 px; vertical: graph on the left, the line on the right
  const view = vert
    ? { x0: 0, x1: 1, y0: r0, y1: r1, fixed: { k: 280 / span, ox: 560, oy: 320 + (r0 * 280) / span } }
    : { x0: r0, x1: r1, y0: 0, y1: 1, fixed: { k: 640 / span, ox: 40 - (r0 * 640) / span, oy: 300 } };

  let cache: Model | null = null;
  const F = () => (cache ??= formula());
  const draw = (P: Painter, m: Model, t: number, part: number) => {
    const s = m.state(t).b;
    const tc = Math.min(Math.max(t, 0), T);
    // the graph panel, drawn as far as the current moment
    const gp = vert ? { xPx: 70, yPx: 40, wPx: 360, hPx: 240 } : { xPx: 150, yPx: 22, wPx: 420, hPx: 150 };
    const tMaxG = g.parts[part]?.graphT ?? Math.max(T, ...(g.graph.ghost ?? []).map(([gt]) => gt)) * 1.05;
    const tg = Math.min(tc, tMaxG);
    const fmt = (n: number) => String(Math.round(n * 1e6) / 1e6);
    if (g.panel === "none") {
      // no graph: the question gives only a table, or the graph is what is asked
    } else if (g.panel === "x") {
      const xg = g.xGraph!;
      const G = P.graph({ ...gp, tMax: tMaxG, vMin: xg.xMin, vMax: xg.xMax, xLabel: "t (s)", yLabel: xg.label ?? "x" });
      const curve = (until: number) => Array.from({ length: 81 }, (_, i) => { const u = (until * i) / 80; return [G.gx(u), G.gy(F().state(u).b.x)] as [number, number]; });
      P.path(curve(T), { tone: "soft", w: 2 });
      P.path(curve(tg), { tone: "body", w: 2.6 });
      (xg.tTicks ?? []).forEach((pt) => P.textPx(G.gx(pt), G.gy(xg.xMin) + 13, fmt(pt), { tone: "data", size: 10 }));
      (xg.xTicks ?? []).forEach(([pv, lab]) => P.textPx(gp.xPx - 4, G.gy(pv) + 4, lab, { tone: "data", size: 10, anchor: "end" }));
    } else if (g.panel === "a") {
      // the acceleration-time graph that the question gives: steps
      const G = P.graph({ ...gp, tMax: tMaxG, vMin: g.graph.vMin, vMax: g.graph.vMax, xLabel: "t", yLabel: g.graph.yLabel ?? "a" });
      const steps = (until: number) => {
        const out: [number, number][][] = [];
        for (let i = 0; i < pts.length - 1; i++) {
          const a0 = pts[i][0], a1 = Math.min(pts[i + 1][0], until);
          if (a1 > a0) out.push([[G.gx(a0), G.gy(slope(i))], [G.gx(a1), G.gy(slope(i))]]);
        }
        return out;
      };
      for (const st of steps(Infinity)) P.path(st, { tone: "soft", w: 2.4 });
      for (const st of steps(tc)) P.path(st, { tone: "body", w: 3 });
      P.arrowScreen(G.gx(tc), gp.yPx + gp.hPx, G.gx(tc), gp.yPx, { tone: "idle", w: 1 });
    } else {
      const G = P.graph({ ...gp, tMax: tMaxG, vMin: g.graph.vMin, vMax: g.graph.vMax, xLabel: "t (s)", yLabel: g.graph.yLabel ?? "v (m/s)" });
      P.path((g.graph.ghost ?? pts).filter(([pt]) => pt <= tMaxG * 1.0001).map(([pt, pv]) => [G.gx(pt), G.gy(pv)]), { tone: "soft", w: 2 });
      // ticks: only numbers of the given graph (data, not answers)
      const tts = g.graph.tTicks ?? [...new Set(pts.map(([pt]) => pt))].filter((pt) => pt > 0);
      tts.forEach((pt, i) => P.textPx(G.gx(pt), G.gy(Math.max(g.graph.vMin, 0)) + 13 + (i % 2) * 11, fmt(pt), { tone: "data", size: 10 }));
      (g.graph.vTicks ?? [...new Set(pts.map(([, pv]) => pv))].filter((pv) => pv !== 0)).forEach((pv) => P.textPx(gp.xPx - 4, G.gy(pv) + 4, fmt(pv), { tone: "data", size: 10, anchor: "end" }));
      const upto: [number, number][] = [];
      for (const [pt, pv] of pts) if (pt <= tg) upto.push([G.gx(pt), G.gy(pv)]);
      upto.push([G.gx(tg), G.gy(F().state(tg).b.vx)]);
      P.path(upto, { tone: "body", w: 2.6 });
      if (tc <= tMaxG) P.arrowScreen(G.gx(tc), gp.yPx + gp.hPx, G.gx(tc), G.gy(F().state(tc).b.vx), { tone: "idle", w: 1 });
    }
    // strobe marks of the places so far
    if (g.strobe) {
      for (let u = 0, k = 0; u <= tc + 1e-9; u += g.strobe.every, k++) {
        const p = F().state(u).b;
        if (vert) P.line(-span * 0.02, p.x, span * 0.02, p.x, { tone: "idle", w: 1.6 });
        else { P.line(p.x, -span * 0.012, p.x, span * 0.012, { tone: "idle", w: 1.6 }); if (g.strobe.labelEvery && k % g.strobe.labelEvery === 0) P.mono(p.x, 0, fmt(Math.round(u * 1000) / 1000), { tone: "data", size: 9, dyPx: 26 }); }
      }
    }
    // the track and the body
    if (vert) {
      P.ground(r0, -span * 0.25, span * 0.25);
      for (const [mx, lab] of g.marks ?? []) { P.line(-span * 0.05, mx, span * 0.05, mx, { tone: "data", w: 1, dash: "3 3" }); P.mono(span * 0.06, mx, lab, { tone: "data", size: 12, anchor: "start", dyPx: 4 }); }
      const shape = g.shape ?? "rocket";
      if (shape === "elevator") { P.line(0, s.x + span * 0.02, 0, r1 + span * 0.1, { tone: "data", w: 1 }); P.block(0, s.x, { wPx: 34, hPx: 40 }); }
      else if (shape === "ball") P.ball(0, s.x);
      else P.poly([[-span * 0.012, s.x], [span * 0.012, s.x], [span * 0.012, s.x + span * 0.05], [0, s.x + span * 0.07], [-span * 0.012, s.x + span * 0.05]], { tone: "body", fill: "body" });
      const vpx = Math.max(-60, Math.min(60, -s.vx * (60 / Math.max(Math.abs(g.graph.vMax), Math.abs(g.graph.vMin)))));
      if (Math.abs(vpx) > 3) P.arrowPx(0, s.x + span * 0.035, 0, vpx, { tone: "vel", label: "v" });
    } else {
      P.ground(0, r0 - span * 0.05, r1 + span * 0.05);
      for (const [mx, lab] of g.marks ?? []) { P.line(mx, 0, mx, -span * 0.04, { tone: "data", w: 1.2 }); P.mono(mx, -span * 0.04, lab, { tone: "data", size: 12, dyPx: 14 }); }
      const shape = g.shape ?? "block";
      if (shape === "cart") P.cart(s.x, 0); else if (shape === "ball") P.ball(s.x, 0); else P.block(s.x, 0);
      const vpx = Math.max(-70, Math.min(70, s.vx * (70 / Math.max(Math.abs(g.graph.vMax), Math.abs(g.graph.vMin)))));
      if (Math.abs(vpx) > 3) P.arrowPx(s.x, span * 0.1, vpx, 0, { tone: "vel", label: "v" });
    }
    g.parts[part]?.ask?.(P, m, t);
    g.extra?.(P, m, t, part);
  };

  return {
    id: g.id,
    view,
    formula,
    simulation,
    order,
    tolTime: T * 2e-4,
    relTol: 2e-3,
    scale: span,
    answers: g.answers,
    parts: g.parts,
    draw,
  };
}

// ───────────── small helpers for marking what is asked (orange, never a value) ─────────────

/** An orange vertical measure from y1 to y2 at x (world), with a label like "h = ?". */
export function askSpan(P: Painter, x: number, y1: number, y2: number, label: string, offPx = 0) {
  P.arrowScreen(P.sx(x) + offPx, P.sy(y1), P.sx(x) + offPx, P.sy(y2), { tone: "ask", w: 2 });
  P.arrowScreen(P.sx(x) + offPx, P.sy(y2), P.sx(x) + offPx, P.sy(y1), { tone: "ask", w: 2 });
  P.textPx(P.sx(x) + offPx + 8, (P.sy(y1) + P.sy(y2)) / 2 + 5, label, { tone: "ask", size: 14, anchor: "start", weight: 700 });
}
/** An orange horizontal measure. */
export function askWidth(P: Painter, x1: number, x2: number, y: number, label: string, offPx = 0) {
  P.arrowScreen(P.sx(x1), P.sy(y) + offPx, P.sx(x2), P.sy(y) + offPx, { tone: "ask", w: 2 });
  P.arrowScreen(P.sx(x2), P.sy(y) + offPx, P.sx(x1), P.sy(y) + offPx, { tone: "ask", w: 2 });
  P.textPx((P.sx(x1) + P.sx(x2)) / 2, P.sy(y) + offPx - 8, label, { tone: "ask", size: 14, weight: 700 });
}
/** An orange label next to a point. */
export function askLabel(P: Painter, x: number, y: number, label: string, dxPx = 14, dyPx = -14) {
  P.textPx(P.sx(x) + dxPx, P.sy(y) + dyPx, label, { tone: "ask", size: 15, anchor: "start", weight: 700 });
}
/** A Hebrew note that appears around a moment (a hard-to-see event, like "starts running!"). */
export function flash(P: Painter, t: number, at: number, x: number, y: number, text: string, width = 0.15, tone: "body" | "runner" | "text" = "text") {
  if (t >= at - 1e-9 && t <= at + width) P.heb(x, y, text, { tone, size: 15 });
}

// ───────────── stories with phases (one or several scenarios) ─────────────

import { scenarios as nest, storyFormula, storySimulation, type AnimSpec as Spec, type Story } from "./engine";

/** Merges several scenarios into one model: bodies and events are named "scenario.name". */
function merge(models: Record<string, Model>): Model {
  const events: Record<string, number> = {}, values: Record<string, number> = {};
  for (const [k, m] of Object.entries(models)) {
    for (const [e, v] of Object.entries(m.events)) events[`${k}.${e}`] = v;
    for (const [e, v] of Object.entries(m.values)) values[`${k}.${e}`] = v;
  }
  const state = (t: number): State => {
    const out: State = {};
    for (const [k, m] of Object.entries(models)) for (const [b, st] of Object.entries(m.state(t))) out[`${k}.${b}`] = st;
    return out;
  };
  return { state, events, values };
}

export type StorySpec = Omit<Spec, "formula" | "simulation" | "order"> & {
  /** One story, or several scenarios (bodies and events are then named "scenario.name"). */
  story?: Story;
  scenarios?: Record<string, Story>;
  /** Order of events: for several scenarios, one list each (by scenario name). */
  order: (string | string[])[] | Record<string, (string | string[])[]>;
};

export function storySpec(o: StorySpec): Spec {
  const { story, scenarios: sc, order, ...rest } = o;
  if (story) return { ...rest, formula: () => storyFormula(story), simulation: () => storySimulation(story), order: order as (string | string[])[] };
  const all = sc!;
  const ord = order as Record<string, (string | string[])[]>;
  return {
    ...rest,
    formula: () => merge(Object.fromEntries(Object.entries(all).map(([k, s]) => [k, storyFormula(s)]))),
    simulation: () => merge(Object.fromEntries(Object.entries(all).map(([k, s]) => [k, storySimulation(s)]))),
    order: nest(...Object.entries(ord).map(([k, l]) => l.map((x) => (Array.isArray(x) ? x.map((y) => `${k}.${y}`) : `${k}.${x}`)))),
  };
}

/** Free flight under gravity (and optional constant extra accelerations) until the body reaches a height. */
export const G = 10;
export function fallPhase(o: { end: string; body: string; ax?: number; ay?: number; toY: number; down?: boolean; also?: string[]; others?: Record<string, [number, number]> }): import("./engine").Phase {
  const ax = o.ax ?? 0, ay = o.ay ?? -G;
  return {
    end: o.end,
    also: o.also,
    acc: { [o.body]: [ax, ay], ...(o.others ?? {}) },
    dur: (s) => {
      const b = s[o.body];
      // y0 + vy t + ay t²/2 = toY → the later root (going down) unless asked for the first crossing going up
      const A = 0.5 * ay, B = b.vy, C = b.y - o.toY;
      if (Math.abs(A) < 1e-12) return -C / B;
      const d = Math.sqrt(Math.max(0, B * B - 4 * A * C));
      const r1 = (-B - d) / (2 * A), r2 = (-B + d) / (2 * A);
      const roots = [r1, r2].filter((r) => r > 1e-9).sort((p, q) => p - q);
      return o.down === false ? roots[0] : roots[roots.length - 1];
    },
    force: () => ({ [o.body]: [ax, ay], ...(o.others ?? {}) }),
    until: (s) => (o.down === false ? s[o.body].y >= o.toY : s[o.body].y <= o.toY && s[o.body].vy <= 0),
  };
}
