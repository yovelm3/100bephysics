/**
 * Shared engine for the animated figures (owner's rules, see CLAUDE.md):
 *  - the question text is the script: every sentence becomes an event with a time, on one clock from the start of the story
 *  - every animation is built twice, independently: (1) closed formulas, (2) a step-by-step simulation of the forces that
 *    detects the events from the state and finds unknowns by search
 *  - the two builds are compared event by event, value by value, and on the order of events; the animation is shown only
 *    if everything agrees (checked in tests and before every build)
 *  - the animation explains and never solves: no answers or computed values are drawn, what is asked is marked in orange
 * This file has no DOM code, so the models run in tests.
 */

export type Body = { x: number; y: number; vx: number; vy: number; [k: string]: number };
export type State = Record<string, Body>;

/** One build of the story: where everything is at time t, when each event happens, and the quantities asked about. */
export type Model = {
  state: (t: number) => State;
  events: Record<string, number>;
  values: Record<string, number>;
};

export const body = (x: number, y: number, vx = 0, vy = 0, extra: Record<string, number> = {}): Body => ({ x, y, vx, vy, ...extra });

// ───────────── build 1 helpers: closed formulas ─────────────

/** Position along a line with constant acceleration. */
export const pos = (x0: number, v0: number, a: number, t: number) => x0 + v0 * t + 0.5 * a * t * t;
export const vel = (v0: number, a: number, t: number) => v0 + a * t;
/** Positive root time to cover distance d from v0 with acceleration a (d, v0, a in the same direction). */
export function timeFor(d: number, v0: number, a: number) {
  if (Math.abs(a) < 1e-12) return d / v0;
  const disc = v0 * v0 + 2 * a * d;
  return (-v0 + Math.sqrt(Math.max(0, disc))) / a;
}

/** A body that moves with constant acceleration in each time segment. Segments are [tStart, x0, y0, vx0, vy0, ax, ay]. */
export type Segment = { t: number; x: number; y: number; vx: number; vy: number; ax: number; ay: number; extra?: Record<string, number> };
export function segments(list: Segment[], tEnd = Infinity) {
  return (t: number): Body => {
    let s = list[0];
    for (const seg of list) if (t >= seg.t - 1e-12) s = seg;
    const tt = Math.min(t, tEnd) - s.t;
    const u = Math.max(0, tt);
    return { x: pos(s.x, s.vx, s.ax, u), y: pos(s.y, s.vy, s.ay, u), vx: vel(s.vx, s.ax, u), vy: vel(s.vy, s.ay, u), ...(s.extra ?? {}) };
  };
}

// ───────────── build 2 helpers: step-by-step simulation ─────────────

export type SimEvent = {
  name: string;
  /** Detected from the state, after each step. Fires once. */
  when: (s: State, t: number, fired: Set<string>) => boolean;
  /** Changes the rules from now on (a force stops, a string breaks, a body sticks…). */
  then?: (s: State, t: number) => void;
  /** Ends the simulation. */
  stop?: boolean;
  /** Snapshot values to keep at this moment. */
  record?: (s: State, t: number) => Record<string, number>;
};

export type SimSetup = {
  init: State;
  /** Accelerations from the forces (Newton's second law), written as forces/mass, from the current state and rules. */
  accel: (s: State, t: number, fired: Set<string>) => Record<string, { ax: number; ay: number }>;
  events: SimEvent[];
  tMax: number;
  dt?: number;
  /** Time between kept samples (for drawing the simulation; events are exact to one step). */
  sampleDt?: number;
  /** Optional constraints applied after each step (a body on a track, a string of fixed length…). */
  constrain?: (s: State, t: number, fired: Set<string>) => void;
};

export type SimResult = { model: Model; fired: string[] };

const clone = (s: State): State => Object.fromEntries(Object.entries(s).map(([k, b]) => [k, { ...b }]));

/** Integrates the motion (semi-implicit Euler, small step) and detects the events from the state. */
export function simulate(setup: SimSetup): SimResult {
  const dt = setup.dt ?? 1e-4;
  const s = clone(setup.init);
  const fired = new Set<string>();
  const order: string[] = [];
  const events: Record<string, number> = {};
  const values: Record<string, number> = {};
  const samples: { t: number; s: State }[] = [{ t: 0, s: clone(s) }];
  const every = Math.max(1, Math.round((setup.sampleDt ?? dt * 20) / dt));
  let t = 0, n = 0, stop = false;
  const check = () => {
    for (const ev of setup.events) {
      if (fired.has(ev.name)) continue;
      if (ev.when(s, t, fired)) {
        fired.add(ev.name); order.push(ev.name); events[ev.name] = t;
        if (ev.record) Object.assign(values, ev.record(s, t));
        ev.then?.(s, t);
        if (ev.stop) stop = true;
      }
    }
  };
  check();
  while (!stop && t < setup.tMax) {
    const acc = setup.accel(s, t, fired);
    for (const [k, b] of Object.entries(s)) {
      const a = acc[k];
      if (!a) continue;
      // exact for an acceleration that is constant during the step
      b.x += b.vx * dt + 0.5 * a.ax * dt * dt; b.y += b.vy * dt + 0.5 * a.ay * dt * dt;
      b.vx += a.ax * dt; b.vy += a.ay * dt;
    }
    setup.constrain?.(s, t, fired);
    t += dt; n++;
    check();
    if (n % every === 0 || stop) samples.push({ t, s: clone(s) });
  }
  if (samples[samples.length - 1].t < t) samples.push({ t, s: clone(s) });
  const state = (tq: number): State => {
    if (tq <= samples[0].t) return clone(samples[0].s);
    let lo = 0, hi = samples.length - 1;
    if (tq >= samples[hi].t) return clone(samples[hi].s);
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (samples[m].t <= tq) lo = m; else hi = m; }
    const a = samples[lo], b = samples[hi], f = (tq - a.t) / (b.t - a.t);
    const out: State = {};
    for (const k of Object.keys(a.s)) {
      out[k] = {} as Body;
      for (const key of Object.keys(a.s[k])) out[k][key] = a.s[k][key] + ((b.s[k]?.[key] ?? a.s[k][key]) - a.s[k][key]) * f;
    }
    return out;
  };
  return { model: { state, events, values }, fired: order };
}

/** Finds x in [lo, hi] where f changes sign (f(lo) and f(hi) of opposite signs). */
export function bisect(f: (x: number) => number, lo: number, hi: number, iters = 60) {
  let flo = f(lo);
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2, fm = f(mid);
    if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid;
  }
  return (lo + hi) / 2;
}

// ───────────── comparison ─────────────

/** An order given as several lists (one per scenario) is marked by wrapping it: [["a", "b"], ["c"]] with nested: true. */
const NESTED = Symbol("nested");
export const scenarios = (...lists: (string | string[])[][]) => Object.assign(lists, { [NESTED]: true }) as unknown as (string | string[])[];
const isNested = (o: unknown) => !!(o as Record<symbol, unknown>)[NESTED];

export type Check = { name: string; a: number; b: number; tol: number; ok: boolean };
export type Verdict = { checks: Check[]; orderOk: boolean; allOk: boolean; problems: string[] };

/**
 * Compares the two builds: every event time, every value, and the order of events.
 * `order` lists the events of the story in order; a group in an inner array happens at the same moment.
 */
export function compare(
  A: Model,
  B: Model,
  opts: { order: (string | string[])[] | (string | string[])[][]; tolTime?: number; tolValue?: Record<string, number>; relTol?: number; scale?: number },
): Verdict {
  const tolTime = opts.tolTime ?? 5e-3;
  const rel = opts.relTol ?? 3e-3;
  const checks: Check[] = [];
  const names = new Set([...Object.keys(A.events), ...Object.keys(B.events)]);
  for (const n of names) {
    const a = A.events[n], b = B.events[n];
    const tol = tolTime + rel * Math.abs(a ?? 0);
    checks.push({ name: `event ${n}`, a, b, tol, ok: Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol });
  }
  const vals = new Set([...Object.keys(A.values), ...Object.keys(B.values)]);
  for (const n of vals) {
    const a = A.values[n], b = B.values[n];
    const tol = opts.tolValue?.[n] ?? Math.max(1e-3, rel * Math.abs(a ?? 0), 2e-4 * (opts.scale ?? 0));
    checks.push({ name: `value ${n}`, a, b, tol, ok: Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol });
  }
  const orderOf = (m: Model, list: (string | string[])[]) => {
    let last = -Infinity;
    for (const step of list) {
      const group = Array.isArray(step) ? step : [step];
      const times = group.map((g) => m.events[g]);
      if (times.some((x) => !Number.isFinite(x))) return false;
      const lo = Math.min(...times), hi = Math.max(...times);
      if (hi - lo > tolTime + rel * Math.abs(hi)) return false;
      if (lo < last - tolTime) return false;
      last = hi;
    }
    return true;
  };
  // several independent scenarios: one order list for each
  const lists = isNested(opts.order) ? (opts.order as unknown as (string | string[])[][]) : [opts.order as (string | string[])[]];
  const listed = new Set(lists.flat(2) as string[]);
  const unlisted = [...names].filter((n) => !listed.has(n));
  const orderOk = lists.every((l) => orderOf(A, l) && orderOf(B, l)) && unlisted.length === 0;
  const problems = [
    ...checks.filter((c) => !c.ok).map((c) => `${c.name}: ${c.a} vs ${c.b} (tol ${c.tol})`),
    ...(orderOk ? [] : [`order: ${JSON.stringify(opts.order)} A=${JSON.stringify(A.events)} B=${JSON.stringify(B.events)} unlisted=${unlisted}`]),
  ];
  return { checks, orderOk, allOk: orderOk && checks.every((c) => c.ok), problems };
}

// ───────────── drawing interface (implemented with SVG in the browser) ─────────────

export type Tone = "body" | "ask" | "data" | "force" | "vel" | "idle" | "line" | "soft" | "text" | "runner" | "b2";

/** World coordinates are meters (y up); sizes are in screen pixels. */
export interface Painter {
  sx(x: number): number;
  sy(y: number): number;
  line(x1: number, y1: number, x2: number, y2: number, o?: { tone?: Tone; w?: number; dash?: string }): void;
  poly(pts: [number, number][], o?: { tone?: Tone; fill?: Tone | "none"; w?: number; close?: boolean; dash?: string }): void;
  circle(x: number, y: number, rPx: number, o?: { tone?: Tone; fill?: Tone | "none"; w?: number; dash?: string }): void;
  /** A circle with radius in world units. */
  ring(x: number, y: number, r: number, o?: { tone?: Tone; w?: number; dash?: string }): void;
  ground(y: number, x1: number, x2: number): void;
  wall(x: number, y1: number, y2: number, side: "left" | "right"): void;
  ball(x: number, y: number, o?: { rPx?: number; tone?: Tone; label?: string }): void;
  block(x: number, y: number, o?: { wPx?: number; hPx?: number; angle?: number; tone?: Tone; label?: string; base?: boolean }): void;
  cart(x: number, y: number, o?: { wPx?: number; tone?: Tone; label?: string }): void;
  person(x: number, y: number, t: number, o?: { moving?: boolean; tone?: Tone; facing?: 1 | -1 }): void;
  spring(x1: number, y1: number, x2: number, y2: number, o?: { coils?: number; ampPx?: number; tone?: Tone }): void;
  pulley(x: number, y: number, rPx?: number): void;
  /** Arrow from a world point, with a screen-pixel vector. */
  arrowPx(x: number, y: number, dxPx: number, dyPx: number, o?: { tone?: Tone; w?: number; label?: string; labelPos?: "end" | "mid"; both?: boolean }): void;
  /** Arrow between two world points. */
  arrow(x1: number, y1: number, x2: number, y2: number, o?: { tone?: Tone; w?: number; label?: string; both?: boolean }): void;
  /** Formula or number label (left to right). */
  mono(x: number, y: number, text: string, o?: { tone?: Tone; size?: number; anchor?: "start" | "middle" | "end"; dxPx?: number; dyPx?: number; weight?: number }): void;
  /** Hebrew label (right to left). */
  heb(x: number, y: number, text: string, o?: { tone?: Tone; size?: number; anchor?: "start" | "middle" | "end"; dxPx?: number; dyPx?: number }): void;
  /** Dimension line with a data label. */
  dim(x1: number, y1: number, x2: number, y2: number, text: string, o?: { offPx?: number; tone?: Tone }): void;
  /** A small graph panel in screen pixels, with a time cursor: returns mapping functions. */
  graph(o: { xPx: number; yPx: number; wPx: number; hPx: number; tMax: number; vMin: number; vMax: number; xLabel: string; yLabel: string }): { gx: (t: number) => number; gy: (v: number) => number };
  path(pxPts: [number, number][], o?: { tone?: Tone; w?: number; dash?: string }): void;
  textPx(x: number, y: number, text: string, o?: { tone?: Tone; size?: number; anchor?: "start" | "middle" | "end"; heb?: boolean; weight?: number }): void;
  arrowScreen(x1: number, y1: number, x2: number, y2: number, o?: { tone?: Tone; w?: number }): void;
}

/** One part of the question: which window of the story it shows, and what the caption says (never the answer). */
export type PartAnim = {
  from?: (m: Model) => number;
  to: (m: Model) => number;
  /** Real seconds per story second when playing. */
  pace: number;
  caption: string;
  /** The part asks for a time: the clock is hidden, so it does not give the answer away. */
  hideClock?: boolean;
};

export type AnimSpec = {
  id: string;
  /** World window: x from x0 to x1 (meters), y from y0 up; the scale fits the width. */
  view: { x0: number; x1: number; y0: number; y1: number; w?: number; h?: number; fixed?: { ox: number; oy: number; k: number } };
  formula: () => Model;
  simulation: () => Model;
  order: (string | string[])[];
  tolTime?: number;
  tolValue?: Record<string, number>;
  relTol?: number;
  /** Size of the scene (meters): positions agree to 0.02% of it. */
  scale?: number;
  /** Values from the exercise answers that the formula build must reproduce (answer, tolerance). */
  answers?: Record<string, [number, number]>;
  parts: PartAnim[];
  draw: (P: Painter, m: Model, t: number, part: number) => void;
};

export function verifySpec(spec: AnimSpec) {
  const A = spec.formula(), B = spec.simulation();
  const v = compare(A, B, { order: spec.order, tolTime: spec.tolTime, tolValue: spec.tolValue, relTol: spec.relTol, scale: spec.scale });
  const answerProblems: string[] = [];
  for (const [k, [ans, tol]] of Object.entries(spec.answers ?? {})) {
    const got = A.values[k] ?? A.events[k];
    if (!(Number.isFinite(got) && Math.abs(got - ans) <= tol)) answerProblems.push(`answer ${k}: ${got} vs ${ans}`);
  }
  return { ...v, allOk: v.allOk && answerProblems.length === 0, problems: [...v.problems, ...answerProblems], A, B };
}

// ───────────── stories made of phases with constant acceleration ─────────────

type Acc = Record<string, [number, number]>;
export type Phase = {
  /** Name of the event that ends this phase. */
  end: string;
  /** Build 1: accelerations in this phase (from the solution's formulas). */
  acc: Acc | ((s: State) => Acc);
  /** Build 1: closed-form duration of the phase, from the state at its start. */
  dur: (s: State, t0: number) => number;
  /** Build 2: accelerations from the forces (Newton's second law). */
  force: (s: State, t: number) => Acc;
  /** Build 2: the event is detected from the state. */
  until: (s: State, t: number, t0: number) => boolean;
  /** Changes made at the end of the phase in both builds (a collision, a body that stops…). */
  jump?: (s: State) => void;
  /** Events at the same moment as the end of this phase (other names for it). */
  also?: string[];
};

export type Story = {
  init: State;
  phases: Phase[];
  /** Values to record at events: name → [event, function of the state]. */
  record?: Record<string, [string, (s: State) => number]>;
  /** Extra events inside a phase, detected in both builds: name → [formula time, simulation condition]. */
  marks?: Record<string, [(f: Model) => number, (s: State, t: number) => boolean]>;
  /** Time after the last event that the story keeps showing. */
  tail?: number;
  dt?: number;
};

const accOf = (a: Acc | ((s: State) => Acc), s: State) => (typeof a === "function" ? a(s) : a);
const advance = (s: State, a: Acc, u: number): State => {
  const out = clone(s);
  for (const [k, b] of Object.entries(out)) {
    const [ax, ay] = a[k] ?? [0, 0];
    b.x = pos(b.x, b.vx, ax, u); b.y = pos(b.y, b.vy, ay, u); b.vx = vel(b.vx, ax, u); b.vy = vel(b.vy, ay, u);
  }
  return out;
};

/** Build 1 of a story: closed formulas phase by phase. */
export function storyFormula(st: Story): Model {
  const starts: { t: number; s: State; a: Acc }[] = [];
  const events: Record<string, number> = {};
  const atEvent: Record<string, State> = {};
  let s = clone(st.init), t = 0;
  for (const ph of st.phases) {
    const a = accOf(ph.acc, s);
    starts.push({ t, s: clone(s), a });
    const d = ph.dur(s, t);
    s = advance(s, a, d);
    t += d;
    ph.jump?.(s);
    events[ph.end] = t; atEvent[ph.end] = clone(s);
    for (const n of ph.also ?? []) { events[n] = t; atEvent[n] = clone(s); }
  }
  const tEnd = t + (st.tail ?? 0);
  const last = clone(s);
  const state = (tq: number): State => {
    if (tq >= t) return advance(last, {}, 0);
    let i = 0;
    while (i < starts.length - 1 && starts[i + 1].t <= tq) i++;
    return advance(starts[i].s, starts[i].a, Math.max(0, tq - starts[i].t));
  };
  const values: Record<string, number> = {};
  for (const [n, [ev, f]] of Object.entries(st.record ?? {})) values[n] = f(atEvent[ev]);
  const m: Model = { state, events, values };
  for (const [n, [ft]] of Object.entries(st.marks ?? {})) events[n] = ft(m);
  void tEnd;
  return m;
}

/** Build 2 of a story: step-by-step simulation; each phase ends when its condition is seen in the state. */
export function storySimulation(st: Story): Model {
  let phase = 0, t0 = 0;
  const values: Record<string, number> = {};
  const recordAt: Record<string, [string, (s: State) => number][]> = {};
  for (const [n, [ev, f]] of Object.entries(st.record ?? {})) (recordAt[ev] ??= []).push([n, f]);
  const evs: SimEvent[] = st.phases.map((ph, i) => ({
    name: ph.end,
    when: (s: State, t: number) => phase === i && ph.until(s, t, t0),
    then: (s: State, t: number) => {
      ph.jump?.(s);
      for (const n of [ph.end, ...(ph.also ?? [])]) for (const [k, f] of recordAt[n] ?? []) values[k] = f(s);
      phase = i + 1; t0 = t;
    },
    stop: i === st.phases.length - 1,
  }));
  for (const [n, [, cond]] of Object.entries(st.marks ?? {})) evs.push({ name: n, when: (s, t) => cond(s, t) });
  const total = st.phases.length;
  const res = simulate({
    init: st.init,
    accel: (s, t) => {
      if (phase >= total) return {};
      const a = st.phases[phase].force(s, t);
      return Object.fromEntries(Object.entries(a).map(([k, [ax, ay]]) => [k, { ax, ay }]));
    },
    events: evs,
    tMax: 1e4,
    dt: st.dt,
  });
  const m = res.model;
  for (const ph of st.phases) for (const n of ph.also ?? []) m.events[n] = m.events[ph.end];
  Object.assign(m.values, values);
  return m;
}
