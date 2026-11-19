import { describe, expect, it } from "vitest";
import { formulaModel, Q, simulationModel, verify } from "./bagrut-1987-q1";

describe("animation 1987 q1: two independent builds must agree", () => {
  const A = formulaModel();
  const B = simulationModel();
  const v = verify(A, B);

  it("every event and quantity matches", () => {
    for (const c of v.checks) expect(c.ok, `${c.name}: ${c.a} vs ${c.b}`).toBe(true);
  });

  it("events happen in the order of the story", () => {
    expect(v.orderOk).toBe(true);
    expect(v.allOk).toBe(true);
  });

  it("the runner starts exactly when the force stops (not later)", () => {
    expect(A.events.runnerStart).toBeCloseTo(Q.tp, 6);
    expect(B.events.runnerStart).toBeCloseTo(Q.tp, 4);
    expect(A.runner(Q.tp - 1e-4).moving).toBe(false);
    expect(A.runner(Q.tp + 1e-4).moving).toBe(true);
  });

  it("matches the exercise answers", () => {
    expect(A.v0).toBeCloseTo(25, 6);
    expect(A.aRun).toBeCloseTo(5.1898, 3);
    expect(A.xGround).toBeCloseTo(30, 6);
  });
});
