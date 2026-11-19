/**
 * Animation script for bagrut 1987 question 1, built twice independently and compared
 * (owner's rule: an animation is shown only if both builds agree on every event and on the order).
 *
 * Script from the question text:
 *  - ball rests at height 7.2 m; a horizontal 1000 N force acts for 0.01 s (mass 400 g)
 *  - a person stands 30.5 m from the launch point
 *  - "at the moment the force stops" the person starts running from rest toward the ball
 *  - part B: caught at height 1.2 m · part C: no catch, ball reaches the ground
 * One clock from the start of the push.
 */

export const Q = { g: 10, H: 7.2, F: 1000, m: 0.4, tp: 0.01, D: 30.5, hCatch: 1.2 };
/** The ball rests this far before the roof edge, so the push ends exactly at the edge. */
export const L0 = 0.5 * (Q.F / Q.m) * Q.tp * Q.tp;

export type BallState = { x: number; y: number; v: number };
export type RunnerState = { x: number; moving: boolean };
export type Events = { forceOff: number; leaveEdge: number; runnerStart: number; catch: number; ground: number };
export type Model = {
  ball: (t: number, withCatch?: boolean) => BallState;
  runner: (t: number) => RunnerState;
  events: Events;
  v0: number;
  aRun: number;
  xCatch: number;
  xGround: number;
};

/** Build 1: closed-form constant-acceleration formulas. */
export function formulaModel(): Model {
  const a0 = Q.F / Q.m, v0 = a0 * Q.tp;
  const tFall = Math.sqrt((2 * (Q.H - Q.hCatch)) / Q.g);
  const xCatch = v0 * tFall;
  const aRun = (2 * (Q.D - xCatch)) / (tFall * tFall);
  const tGroundFall = Math.sqrt((2 * Q.H) / Q.g);
  const ball = (t: number): BallState => {
    if (t <= 0) return { x: -L0, y: Q.H, v: 0 };
    if (t <= Q.tp) return { x: -L0 + 0.5 * a0 * t * t, y: Q.H, v: a0 * t };
    const s = t - Q.tp;
    return { x: v0 * s, y: Math.max(0, Q.H - 0.5 * Q.g * s * s), v: v0 };
  };
  const runner = (t: number): RunnerState => (t <= Q.tp ? { x: Q.D, moving: false } : { x: Q.D - 0.5 * aRun * (t - Q.tp) ** 2, moving: true });
  return {
    ball, runner, v0, aRun, xCatch, xGround: v0 * tGroundFall,
    events: { forceOff: Q.tp, leaveEdge: Q.tp, runnerStart: Q.tp, catch: Q.tp + tFall, ground: Q.tp + tGroundFall },
  };
}

type Sample = { t: number; bx: number; by: number; vx: number; rx: number; running: boolean };

/** Build 2: step-by-step simulation. Events are detected from the state; the runner's acceleration is found by search. */
export function simulationModel(): Model {
  const dt = 1e-5;
  function run(aRun: number, stopAtCatch: boolean) {
    let t = 0, bx = -L0, by = Q.H, vx = 0, vy = 0, forceOn = true, onRoof = true;
    let rx = Q.D, rv = 0, running = false;
    const ev: Partial<Events> & { gap?: number; xCatch?: number; xGround?: number } = {};
    const track: Sample[] = [];
    let next = 0;
    while (t < 3) {
      if (t >= next - 1e-12) { track.push({ t, bx, by, vx, rx, running }); next += 0.002; }
      const ax = forceOn ? Q.F / Q.m : 0;
      const ay = onRoof ? 0 : -Q.g;
      vx += ax * dt; vy += ay * dt; bx += vx * dt; by += vy * dt;
      if (running) { rv += aRun * dt; rx -= rv * dt; }
      t += dt;
      if (forceOn && t >= Q.tp - 1e-12) { forceOn = false; ev.forceOff = t; running = true; ev.runnerStart = t; }
      if (onRoof && bx >= 0) { onRoof = false; ev.leaveEdge = t; }
      if (stopAtCatch && running && by <= Q.hCatch && ev.catch === undefined) { ev.catch = t; ev.gap = rx - bx; ev.xCatch = bx; break; }
      if (by <= 0) { by = 0; ev.ground = t; ev.xGround = bx; break; }
    }
    track.push({ t, bx, by, vx, rx, running });
    return { ev, track, v0: vx };
  }
  let lo = 0, hi = 50;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if ((run(mid, true).ev.gap ?? 0) > 0) lo = mid; else hi = mid;
  }
  const aRun = (lo + hi) / 2;
  const withRunner = run(aRun, true);
  const noRunner = run(0, false);
  const sample = (track: Sample[], t: number) => {
    let i = 0;
    while (i < track.length - 1 && track[i + 1].t <= t) i++;
    return track[i];
  };
  return {
    aRun, v0: noRunner.v0, xCatch: withRunner.ev.xCatch!, xGround: noRunner.ev.xGround!,
    events: {
      forceOff: withRunner.ev.forceOff!, leaveEdge: withRunner.ev.leaveEdge!, runnerStart: withRunner.ev.runnerStart!,
      catch: withRunner.ev.catch!, ground: noRunner.ev.ground!,
    },
    ball: (t, withCatch = true) => { const s = sample(withCatch ? withRunner.track : noRunner.track, t); return { x: s.bx, y: Math.max(0, s.by), v: s.vx }; },
    runner: (t) => { const s = sample(withRunner.track, t); return { x: s.rx, moving: s.running }; },
  };
}

export type Check = { name: string; a: number; b: number; tol: number; ok: boolean };

/** Compares the two builds event by event and checks the order of events against the story. */
export function verify(A: Model, B: Model): { checks: Check[]; orderOk: boolean; allOk: boolean } {
  const rows: Omit<Check, "ok">[] = [
    { name: "force stops", a: A.events.forceOff, b: B.events.forceOff, tol: 2e-4 },
    { name: "ball leaves the roof", a: A.events.leaveEdge, b: B.events.leaveEdge, tol: 2e-4 },
    { name: "runner starts", a: A.events.runnerStart, b: B.events.runnerStart, tol: 2e-4 },
    { name: "exit speed", a: A.v0, b: B.v0, tol: 0.01 },
    { name: "catch time", a: A.events.catch, b: B.events.catch, tol: 2e-3 },
    { name: "catch position", a: A.xCatch, b: B.xCatch, tol: 0.05 },
    { name: "runner acceleration", a: A.aRun, b: B.aRun, tol: 0.03 },
    { name: "ground time", a: A.events.ground, b: B.events.ground, tol: 2e-3 },
    { name: "ground distance", a: A.xGround, b: B.xGround, tol: 0.05 },
  ];
  const checks = rows.map((r) => ({ ...r, ok: Number.isFinite(r.a) && Number.isFinite(r.b) && Math.abs(r.a - r.b) <= r.tol }));
  const order = (e: Events) =>
    Math.abs(e.forceOff - e.runnerStart) < 2e-4 && Math.abs(e.forceOff - e.leaveEdge) < 2e-4 && e.leaveEdge < e.catch && e.catch < e.ground;
  const orderOk = order(A.events) && order(B.events);
  return { checks, orderOk, allOk: orderOk && checks.every((c) => c.ok) };
}
