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
  graph: { vMin: number; vMax: number; yLabel?: string; tTicks?: number[]; vTicks?: number[]; ghost?: [number, number][]; sign?: 1 | -1 };
  /** graphT: the time window of the graph panel in this part (to zoom on the start). */
  parts: (PartAnim & { ask?: (P: Painter, m: Model, t: number) => void; graphT?: number })[];
  /** Which graph the question gives: velocity (default) or acceleration (steps). */
  panel?: "v" | "a" | "x" | "none";
  /** Position-time graph panel (when the question gives x(t)): window and range in meters. */
  xGraph?: { xMin: number; xMax: number; label?: string; tTicks?: number[]; xTicks?: [number, string][] };
  /** Marks of the body's place every `every` seconds, like a strobe photo or a measurement table. */
  strobe?: { every: number; labelEvery?: number };
  /** Move along this curved path (meters) instead of a straight line; the position is the distance along it. */
  along?: [number, number][];
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
      // sign -1: the graph is drawn with the positive axis downwards, as in the question
      const sg = g.graph.sign ?? 1;
      P.path((g.graph.ghost ?? pts.map(([pt, pv]) => [pt, sg * pv] as [number, number])).filter(([pt]) => pt <= tMaxG * 1.0001).map(([pt, pv]) => [G.gx(pt), G.gy(pv)]), { tone: "soft", w: 2 });
      // ticks: only numbers of the given graph (data, not answers)
      const tts = g.graph.tTicks ?? [...new Set(pts.map(([pt]) => pt))].filter((pt) => pt > 0);
      tts.filter((pt) => pt <= tMaxG).forEach((pt, i) => P.textPx(G.gx(pt), G.gy(Math.max(g.graph.vMin, 0)) + 13 + (i % 2) * 11, fmt(pt), { tone: "data", size: 10 }));
      (g.graph.vTicks ?? [...new Set(pts.map(([, pv]) => sg * pv))].filter((pv) => pv !== 0)).forEach((pv) => P.textPx(gp.xPx - 4, G.gy(pv) + 4, fmt(pv), { tone: "data", size: 10, anchor: "end" }));
      const upto: [number, number][] = [];
      for (const [pt, pv] of pts) if (pt <= tg) upto.push([G.gx(pt), G.gy(sg * pv)]);
      upto.push([G.gx(tg), G.gy(sg * F().state(tg).b.vx)]);
      P.path(upto, { tone: "body", w: 2.6 });
      if (tc <= tMaxG) P.arrowScreen(G.gx(tc), gp.yPx + gp.hPx, G.gx(tc), G.gy(sg * F().state(tc).b.vx), { tone: "idle", w: 1 });
    }
    // strobe marks of the places so far
    if (g.strobe && !g.along) {
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
    } else if (g.along) {
      // the body moves along a drawn curved path: the position is the distance along it
      const pts = g.along, Ls: number[] = [0];
      for (let i = 1; i < pts.length; i++) Ls.push(Ls[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const pointAt = (d: number) => { let i = 0; while (i < pts.length - 2 && Ls[i + 1] < d) i++; const f = (d - Ls[i]) / (Ls[i + 1] - Ls[i] || 1); return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; };
      P.poly(pts, { close: false, fill: "none", tone: "line", w: 3 });
      if (g.strobe) for (let u = 0; u <= tc + 1e-9; u += g.strobe.every) { const [px, py] = pointAt(F().state(u).b.x); P.circle(px, py, 3, { fill: "idle" }); }
      const [bx, by] = pointAt(s.x);
      P.ball(bx, by, { rPx: 8 });
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

import { isNested, scenarios as nest, storyFormula, storySimulation, type AnimSpec as Spec, type Story } from "./engine";

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

// ───────────── several animated stories in one exercise (parts from different specs) ─────────────

/** Joins specs: the parts of each come in order. Bodies, events and values are kept apart by a prefix. */
export function joinSpecs(id: string, list: { key: string; spec: Spec; parts: number[] }[], seq?: [string, number][]): Spec {
  const sub = (m: Model, key: string): Model => {
    const pre = `${key}:`;
    const pick = <T,>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).filter(([k]) => k.startsWith(pre)).map(([k, v]) => [k.slice(pre.length), v]));
    return { state: (t) => pick(m.state(t)), events: pick(m.events), values: pick(m.values) };
  };
  const join = (build: "formula" | "simulation") => (): Model => {
    const ms = list.map((l) => [l.key, l.spec[build]()] as const);
    const events: Record<string, number> = {}, values: Record<string, number> = {};
    for (const [k, m] of ms) {
      for (const [e, v] of Object.entries(m.events)) events[`${k}:${e}`] = v;
      for (const [e, v] of Object.entries(m.values)) values[`${k}:${e}`] = v;
    }
    return {
      events, values,
      state: (t) => Object.fromEntries(ms.flatMap(([k, m]) => Object.entries(m.state(t)).map(([b, st]) => [`${k}:${b}`, st]))),
    };
  };
  const parts: PartAnim[] = [];
  const owners: { key: string; spec: Spec; idx: number }[] = [];
  // the parts in the question's order: as listed, or as given in seq ([key, part index] pairs)
  const pairs = seq ? seq.map(([k, i]) => [list.find((l) => l.key === k)!, i] as const) : list.flatMap((l) => l.parts.map((i) => [l, i] as const));
  for (const [l, i] of pairs) {
    const p = l.spec.parts[i];
    owners.push({ key: l.key, spec: l.spec, idx: i });
    parts.push({ ...p, from: p.from ? (m) => p.from!(sub(m, l.key)) : undefined, to: (m) => p.to(sub(m, l.key)) });
  }
  const orders = list.map((l) => {
    const o = l.spec.order as (string | string[])[];
    const lists = isNestedOrder(o) ? (o as unknown as (string | string[])[][]) : [o];
    return lists.map((li) => li.map((x) => (Array.isArray(x) ? x.map((y) => `${l.key}:${y}`) : `${l.key}:${x}`)));
  }).flat();
  return {
    id,
    view: list[0].spec.view,
    formula: join("formula"),
    simulation: join("simulation"),
    order: nest(...orders),
    tolTime: Math.min(...list.map((l) => l.spec.tolTime ?? 5e-3)),
    relTol: Math.min(...list.map((l) => l.spec.relTol ?? 3e-3)),
    scale: Math.max(...list.map((l) => l.spec.scale ?? 0)),
    answers: Object.fromEntries(list.flatMap((l) => Object.entries(l.spec.answers ?? {}).map(([k, v]) => [`${l.key}:${k}`, v]))),
    parts,
    draw: (P, m, t, part) => { const o = owners[part]; o.spec.draw(P, sub(m, o.key), t, o.idx); },
    views: owners.map((o) => o.spec.view),
  } as Spec;
}
const isNestedOrder = (o: unknown) => isNested(o);

// ───────────── a body sliding on a curved track, no friction ─────────────

export type Track = {
  id: string;
  /** The track: points along it from the start (x, y in meters); the body starts at the first point. */
  path: [number, number][];
  v0?: number;
  answers?: Record<string, [number, number]>;
  view: Spec["view"];
  parts: (PartAnim & { ask?: (P: Painter, m: Model, t: number) => void })[];
  extra?: (P: Painter, m: Model, t: number, part: number) => void;
  /** Stop where the track ends, or at this index of the path. */
  endIndex?: number;
  /** Named points along the track (path index): events when the body passes them, and its speed there (v@name). */
  points?: Record<string, number>;
  dt?: number;
  /** Draw the track and the ball (default), or leave all drawing to extra. */
  bare?: boolean;
};

export function trackMotion(o: Track): Spec {
  // arc length along the polyline
  const pts = o.path, L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const end = o.endIndex ?? pts.length - 1, S = L[end];
  const at = (s: number) => {
    let i = 0;
    while (i < pts.length - 2 && L[i + 1] < s) i++;
    const f = (s - L[i]) / (L[i + 1] - L[i] || 1);
    const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
    const sin = (pts[i + 1][1] - pts[i][1]) / (L[i + 1] - L[i] || 1);
    return { x, y, sin, cos: (pts[i + 1][0] - pts[i][0]) / (L[i + 1] - L[i] || 1) };
  };
  const v0 = o.v0 ?? 0, y0 = pts[0][1];
  const speedAt = (s: number) => Math.sqrt(Math.max(0, v0 * v0 + 2 * G * (y0 - at(s).y)));
  // build 1: speed from energy conservation; time from summing ds / v along the track
  const formula = (): Model => {
    const N = 20000, ts: number[] = [0], ss: number[] = [0];
    for (let k = 1; k <= N; k++) {
      const s1 = (S * (k - 1)) / N, s2 = (S * k) / N, vm = (speedAt(s1) + speedAt(s2)) / 2;
      ts.push(ts[k - 1] + (s2 - s1) / Math.max(vm, 1e-9)); ss.push(s2);
    }
    const T = ts[N];
    const sOf = (t: number) => { if (t >= T) return S; let lo = 0, hi = N; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ts[mid] <= t) lo = mid; else hi = mid; } return ss[lo] + ((t - ts[lo]) / (ts[hi] - ts[lo])) * (ss[hi] - ss[lo]); };
    const state = (t: number): State => { const s = sOf(Math.max(0, t)), p = at(s), v = speedAt(s); return { b: body(p.x, p.y, v * p.cos, v * p.sin, { s, v }) }; };
    const events: Record<string, number> = { end: T }, values: Record<string, number> = { vEnd: speedAt(S) };
    const tAt = (sq: number) => { let lo = 0, hi = N; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ss[mid] <= sq) lo = mid; else hi = mid; } return ts[lo] + ((sq - ss[lo]) / (ss[hi] - ss[lo])) * (ts[hi] - ts[lo]); };
    for (const [n, i] of Object.entries(o.points ?? {})) { events[n] = tAt(L[i]); values[`v@${n}`] = speedAt(L[i]); }
    return { state, events, values };
  };
  // build 2: step by step along the track, with the tangential part of gravity
  const simulation = (): Model => {
    const res = simulate({
      init: { b: body(0, 0, v0, 0) },
      accel: (s) => ({ b: { ax: -G * at(s.b.x).sin, ay: 0 } }),
      events: [
        ...Object.entries(o.points ?? {}).map(([n, i]) => ({ name: n, when: (s: State) => s.b.x >= L[i], record: (s: State) => ({ [`v@${n}`]: s.b.vx }) })),
        { name: "end", when: (s) => s.b.x >= S, stop: true, record: (s) => ({ vEnd: s.b.vx }) },
      ],
      tMax: 1e3,
      dt: o.dt ?? 1e-4,
    });
    const m = res.model, st = m.state;
    m.state = (t) => { const q = st(t).b, p = at(Math.min(q.x, S)); return { b: body(p.x, p.y, q.vx * p.cos, q.vx * p.sin, { s: q.x, v: q.vx }) }; };
    return m;
  };
  return {
    id: o.id, view: o.view, formula, simulation, answers: o.answers, scale: S, tolTime: 2e-3, relTol: 3e-3,
    order: [...Object.entries(o.points ?? {}).sort((a, b) => a[1] - b[1]).map(([n]) => n), "end"],
    parts: o.parts,
    draw: (P, m, t, part) => {
      if (!o.bare) {
        P.poly(pts.slice(0, end + 1).map(([x, y]) => [x, y] as [number, number]), { close: false, fill: "none", tone: "line", w: 2.4 });
        const b = m.state(t).b;
        P.ball(b.x, b.y, { rPx: 8 });
      }
      o.parts[part]?.ask?.(P, m, t);
      o.extra?.(P, m, t, part);
    },
  };
}

/** Points on a circular arc around (cx, cy), radius R, from angle a0 to a1 (radians, measured from straight down, counterclockwise). */
export function arc(cx: number, cy: number, R: number, a0: number, a1: number, n = 400): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + R * Math.sin(a), cy - R * Math.cos(a)] as [number, number]; });
}

// ───────────── uniform circular motion (a horizontal circle) ─────────────

export type Spin = {
  id: string;
  /** Radius (m) and period (s). */
  r: number;
  period: number;
  /** How many laps the story lasts. */
  laps: number;
  answers?: Record<string, [number, number]>;
  view: Spec["view"];
  views?: Spec["view"][];
  parts: PartAnim[];
  /** Draws the scene; c is the body's place in the circle's plane (x, z), with its velocity (vx, vz) and the angle. */
  draw: (P: Painter, c: { x: number; z: number; vx: number; vz: number; ang: number }, m: Model, t: number, part: number) => void;
};

/** Build 1: angle = ω·t. Build 2: step by step with only an acceleration v²/r toward the center (no ω given to it). */
export function spinMotion(o: Spin): Spec {
  const w = (2 * Math.PI) / o.period, T = o.laps * o.period;
  const formula = (): Model => {
    const state = (t: number): State => { const tt = Math.min(Math.max(t, 0), T), a = w * tt; return { b: body(o.r * Math.cos(a), o.r * Math.sin(a), -w * o.r * Math.sin(a), w * o.r * Math.cos(a), { ang: a }) }; };
    const events: Record<string, number> = {};
    for (let k = 1; k <= o.laps; k++) events[`lap${k}`] = k * o.period;
    return { state, events, values: { v: w * o.r, a: w * w * o.r } };
  };
  const simulation = (): Model => {
    let lap = 0, prevY = 0, lapT = -Infinity;
    const res = simulate({
      init: { b: body(o.r, 0, 0, w * o.r) },
      accel: (s) => { const b = s.b, r2 = b.x * b.x + b.y * b.y, v2 = b.vx * b.vx + b.vy * b.vy; prevY = b.y; return { b: { ax: (-v2 * b.x) / r2, ay: (-v2 * b.y) / r2 } }; },
      events: Array.from({ length: o.laps }, (_, k) => ({
        name: `lap${k + 1}`,
        when: (s: State, t: number) => { const hit = prevY < 0 && s.b.y >= 0 && s.b.x > 0 && lap === k && t > lapT + o.period / 4; if (hit) { lap++; lapT = t; } return hit; },
        stop: k === o.laps - 1,
        record: (s: State): Record<string, number> => (k === 0 ? { v: Math.hypot(s.b.vx, s.b.vy), a: (s.b.vx ** 2 + s.b.vy ** 2) / Math.hypot(s.b.x, s.b.y) } : {}),
      })),
      tMax: T * 1.1,
      dt: o.period / 2e5,
    });
    return res.model;
  };
  return {
    id: o.id, view: o.view, views: o.views, formula, simulation, answers: o.answers, scale: o.r, relTol: 2e-3,
    order: Array.from({ length: o.laps }, (_, k) => `lap${k + 1}`),
    parts: o.parts,
    draw: (P, m, t, part) => { const b = m.state(t).b; o.draw(P, { x: b.x, z: b.y, vx: b.vx, vz: b.vy, ang: Math.atan2(b.y, b.x) }, m, t, part); },
  };
}

/** Points along a straight segment (for building tracks), without the first point. */
export function seg(a: [number, number], b: [number, number], n = 40): [number, number][] {
  return Array.from({ length: n }, (_, i) => [a[0] + ((b[0] - a[0]) * (i + 1)) / n, a[1] + ((b[1] - a[1]) * (i + 1)) / n] as [number, number]);
}

// ───────────── a head-on collision of two bodies (or a body and a wall) ─────────────

export type Collision = {
  id: string;
  /** Centers (m), velocities (m/s), masses (kg) and widths (m, for the contact) of the two bodies. */
  a: { m: number; x: number; v: number; w: number };
  /** The second body, or a wall at x (its face). */
  b: { m: number; x: number; v: number; w: number } | { wall: number };
  kind: "elastic" | "plastic";
  /** Stiffness of the contact (N/m): the collision lasts about π·√(μ/k). */
  k: number;
  /** How long the story lasts. */
  tEnd: number;
  answers?: Record<string, [number, number]>;
  view: Spec["view"];
  views?: Spec["view"][];
  parts: PartAnim[];
  draw: (P: Painter, m: Model, t: number, part: number) => void;
};

/**
 * Build 1: closed formulas: the center of mass moves uniformly, and during the contact the compression is
 * (v_rel/ω)·sin(ωτ), ω = √(k/μ) (for a plastic collision the bodies lock at the largest compression).
 * Build 2: step by step with a contact force k·overlap; a plastic collision locks when the bodies stop approaching.
 * Values: va, vb (after), F (the largest contact force), dK (kinetic energy lost).
 */
export function collision(o: Collision): Spec {
  const wall = "wall" in o.b;
  const A = o.a, Bb = wall ? { m: Infinity, x: (o.b as { wall: number }).wall, v: 0, w: 0 } : (o.b as Collision["a"]);
  const D0 = (A.w + Bb.w) / 2;
  const mu = wall ? A.m : (A.m * Bb.m) / (A.m + Bb.m);
  const Mt = wall ? A.m : A.m + Bb.m;
  const w = Math.sqrt(o.k / mu);
  const vrel = A.v - Bb.v;
  const tHit = (Bb.x - A.x - D0) / vrel;
  const plastic = o.kind === "plastic";
  const tau = plastic ? Math.PI / (2 * w) : Math.PI / w;
  const Vc = wall ? 0 : (A.m * A.v + Bb.m * Bb.v) / Mt;
  const after = plastic ? { va: Vc, vb: wall ? 0 : Vc } : wall ? { va: -A.v, vb: 0 } : { va: (2 * Vc - A.v), vb: (2 * Vc - Bb.v) };
  const K0 = 0.5 * A.m * A.v ** 2 + (wall ? 0 : 0.5 * Bb.m * Bb.v ** 2);
  const K1 = 0.5 * A.m * after.va ** 2 + (wall ? 0 : 0.5 * Bb.m * after.vb ** 2);
  const formula = (): Model => {
    const xa1 = A.x + A.v * tHit, xb1 = Bb.x + Bb.v * tHit;
    const sMax = vrel / w;
    const state = (tq: number): State => {
      const t = Math.min(Math.max(tq, 0), o.tEnd);
      if (t <= tHit) return { a: body(A.x + A.v * t, 0, A.v, 0), b: body(Bb.x + Bb.v * t, 0, Bb.v, 0) };
      const u = Math.min(t - tHit, tau);
      const s = (vrel / w) * Math.sin(w * u), ds = vrel * Math.cos(w * u);
      let xa: number, xb: number, va: number, vb: number;
      if (wall) { xa = xa1 + s; xb = Bb.x; va = ds; vb = 0; }
      else {
        const xc = (A.m * xa1 + Bb.m * xb1) / Mt + Vc * u, d = D0 - s;
        xa = xc - (Bb.m / Mt) * d; xb = xc + (A.m / Mt) * d; va = Vc + (Bb.m / Mt) * ds; vb = Vc - (A.m / Mt) * ds;
      }
      const rest = t - tHit - u;
      return { a: body(xa + after.va * rest, 0, rest > 0 ? after.va : va, 0), b: body(xb + after.vb * rest, 0, rest > 0 ? after.vb : vb, 0) };
    };
    return { state, events: { hit: tHit, [plastic ? "stick" : "sep"]: tHit + tau, end: o.tEnd }, values: { ...after, F: o.k * sMax, ...(plastic ? { dK: K0 - K1 } : {}) } };
  };
  const simulation = (): Model => {
    let stuck = false, Fmax = 0;
    const overlap = (s: State) => D0 - (s.b.x - s.a.x);
    const res = simulate({
      init: { a: body(A.x, 0, A.v, 0), b: body(Bb.x, 0, Bb.v, 0) },
      accel: (s) => {
        if (stuck) return { a: { ax: 0, ay: 0 }, b: { ax: 0, ay: 0 } };
        const F = Math.max(0, o.k * overlap(s));
        Fmax = Math.max(Fmax, F);
        return { a: { ax: -F / A.m, ay: 0 }, b: { ax: wall ? 0 : F / Bb.m, ay: 0 } };
      },
      events: [
        { name: "hit", when: (s) => overlap(s) >= 0 },
        plastic
          ? { name: "stick", when: (s, _t, f) => f.has("hit") && s.a.vx - s.b.vx <= 0, then: (s) => { const V = wall ? 0 : (A.m * s.a.vx + Bb.m * s.b.vx) / Mt; s.a.vx = V; s.b.vx = V; stuck = true; }, record: () => ({ F: Fmax }) }
          : { name: "sep", when: (s, _t, f) => f.has("hit") && overlap(s) < 0, record: (s) => ({ va: s.a.vx, vb: s.b.vx, F: Fmax }) },
        { name: "end", when: (_s, t) => t >= o.tEnd - 1e-12, stop: true, record: (s): Record<string, number> => ({ va: s.a.vx, vb: s.b.vx, ...(plastic ? { dK: K0 - 0.5 * A.m * s.a.vx ** 2 - (wall ? 0 : 0.5 * Bb.m * s.b.vx ** 2) } : {}) }) },
      ],
      tMax: o.tEnd * 1.01,
      dt: tau / 4000,
      sampleDt: Math.min(tau / 50, o.tEnd / 2000),
    });
    return res.model;
  };
  return {
    id: o.id, view: o.view, views: o.views, formula, simulation, answers: o.answers,
    order: ["hit", plastic ? "stick" : "sep", "end"],
    scale: Math.max(1e-3, Math.abs(A.v) * o.tEnd), relTol: 3e-3, tolTime: tau / 20,
    parts: o.parts, draw: o.draw,
  };
}

// ───────────── two bodies pushed apart by a compressed spring (touching, not attached) ─────────────

/**
 * Bodies a (left) and b (right) at rest, a spring of natural length L0 compressed by x0 between them.
 * Build 1: the compression is x0·cos(ωt), ω = √(k/μ), until it reaches zero; then constant speeds.
 * Build 2: the spring force k·compression, step by step, until it lets go. Values: va, vb (after), E (stored).
 */
export function springApart(o: { ma: number; mb: number; k: number; x0: number; L0: number; tEnd: number }): { formula: () => Model; simulation: () => Model } {
  const { ma, mb, k, x0, L0, tEnd } = o, M = ma + mb;
  const mu = (ma * mb) / M, w = Math.sqrt(k / mu), tau = Math.PI / (2 * w);
  const formula = (): Model => {
    const state = (tq: number): State => {
      const t = Math.min(Math.max(tq, 0), tEnd), u = Math.min(t, tau);
      const s = x0 * Math.cos(w * u), ds = -x0 * w * Math.sin(w * u);
      const d = L0 - s, xa = -(mb / M) * d, xb = (ma / M) * d, va = (mb / M) * ds, vb = -(ma / M) * ds, rest = t - u;
      return { a: body(xa + va * rest, 0, va, 0), b: body(xb + vb * rest, 0, vb, 0) };
    };
    const v = x0 * w;
    return { state, events: { free: tau, end: tEnd }, values: { va: -(mb / M) * v, vb: (ma / M) * v, E: 0.5 * k * x0 * x0 } };
  };
  const simulation = (): Model => {
    const comp = (s: State) => L0 - (s.b.x - s.a.x);
    return simulate({
      init: { a: body(-(mb / M) * (L0 - x0), 0, 0, 0), b: body((ma / M) * (L0 - x0), 0, 0, 0) },
      accel: (s) => { const F = Math.max(0, k * comp(s)); return { a: { ax: -F / ma, ay: 0 }, b: { ax: F / mb, ay: 0 } }; },
      events: [
        { name: "free", when: (s) => comp(s) <= 0, record: (s) => ({ va: s.a.vx, vb: s.b.vx, E: 0.5 * ma * s.a.vx ** 2 + 0.5 * mb * s.b.vx ** 2 }) },
        { name: "end", when: (_s, t) => t >= tEnd - 1e-12, stop: true },
      ],
      tMax: tEnd * 1.1,
      dt: tau / 3000,
    }).model;
  };
  return { formula, simulation };
}
