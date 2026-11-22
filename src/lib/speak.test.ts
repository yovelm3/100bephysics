import { describe, expect, it } from "vitest";
import { speakable } from "./speak";

describe("speakable", () => {
  it("turns a formula label into plain text", () => {
    expect(speakable(String.raw`$t = 0.4\,\text{s}$`)).toBe("t = 0.4 s");
    expect(speakable(String.raw`הזווית $\alpha$ מעל האופק`)).toBe("הזווית alpha מעל האופק");
    expect(speakable(String.raw`$90^\circ$`)).toBe("90°");
    expect(speakable("בקמ\"ש")).toBe("בקמ\"ש");
  });
});
