import { describe, expect, it } from "vitest";
import { splitRuns } from "./MixedText";

describe("splitRuns", () => {
  it("isolates number runs", () => {
    expect(splitRuns("במפתח 4.4·10^7 m, אבל")).toEqual(["במפתח ", "4.4·10^7 m", ", אבל"]);
  });
  it("keeps sentence punctuation with the Hebrew", () => {
    expect(splitRuns("(מ-0 עד 0.04).")).toEqual(["(מ-", "0", " עד ", "0.04", ")."]);
    expect(splitRuns("והתאוצה 12.")).toEqual(["והתאוצה ", "12", "."]);
  });
  it("keeps a balanced parenthesis inside the run", () => {
    expect(splitRuns("x (cm) כאן")).toEqual(["", "x (cm)", " כאן"]);
  });
});
