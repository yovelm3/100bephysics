import { describe, expect, it } from "vitest";
import { checkChoice, checkNumber, countSigFigs, parseAnswer } from "./answer-check";

describe("parseAnswer", () => {
  const cases: [string, number, number][] = [
    ["25", 25, 2],
    ["25.0", 25, 3],
    ["2,5", 2.5, 2],
    [" 27.39 ", 27.39, 4],
    ["-9.8", -9.8, 2],
    ["−9.8", -9.8, 2],
    ["0.0250", 0.025, 3],
    [".5", 0.5, 1],
    ["4e3", 4000, 1],
    ["4.0e3", 4000, 2],
    ["4.0E-3", 0.004, 2],
    ["4×10³", 4000, 1],
    ["4.2×10³", 4200, 2],
    ["4.2*10^3", 4200, 2],
    ["4.2x10^-3", 0.0042, 2],
    ["4,2 × 10⁻³", 0.0042, 2],
    ["6.67·10^-11", 6.67e-11, 3],
    ["30", 30, 2],
    ["300", 300, 3],
  ];
  it.each(cases)("%s → %d (%d sig figs)", (raw, value, sig) => {
    const p = parseAnswer(raw)!;
    expect(p).not.toBeNull();
    expect(p.value).toBeCloseTo(value, 12);
    expect(p.sigFigs).toBe(sig);
  });

  it.each(["", "abc", "2.5.1", "5 m/s", "1/2", "--3", "e3"])("rejects %j", (raw) => {
    expect(parseAnswer(raw)).toBeNull();
  });

  it("counts significant figures", () => {
    expect(countSigFigs("0.00120")).toBe(3);
    expect(countSigFigs("1200")).toBe(4);
    expect(countSigFigs("0")).toBe(1);
  });
});

describe("checkNumber: the owner's examples", () => {
  it("exact 27.39: 27.4 and 27 are correct, 28 is not", () => {
    expect(checkNumber("27.4", 27.39)).toBe("correct");
    expect(checkNumber("27", 27.39)).toBe("correct");
    expect(checkNumber("27.39", 27.39)).toBe("correct");
    expect(checkNumber("28", 27.39)).toBe("wrong");
    expect(checkNumber("27.3", 27.39)).toBe("wrong");
  });

  it("fewer than 2 significant figures → message, not a wrong attempt", () => {
    expect(checkNumber("3", 3.2)).toBe("too_few_digits");
    expect(checkNumber("30", 27.39)).toBe("wrong"); // 2 sig figs, and 27.39 rounds to 27
    expect(checkNumber("4e3", 4000)).toBe("too_few_digits");
    expect(checkNumber("4.0e3", 4000)).toBe("correct");
  });

  it("works with the real 1987 answers", () => {
    const a = 5.189786874569495;
    expect(checkNumber("5.19", a)).toBe("correct");
    expect(checkNumber("5.2", a)).toBe("correct");
    expect(checkNumber("5.1898", a)).toBe("correct");
    expect(checkNumber("5.18", a)).toBe("wrong");
    expect(checkNumber("25", 25)).toBe("correct");
    expect(checkNumber("25.0", 25)).toBe("correct");
    expect(checkNumber("25.01", 25)).toBe("wrong");
    expect(checkNumber("30", 30)).toBe("correct");
  });

  it("comma and scientific notation are accepted", () => {
    expect(checkNumber("5,19", 5.1897)).toBe("correct");
    expect(checkNumber("2.5×10³", 2500)).toBe("correct");
    expect(checkNumber("2.5*10^3", 2500)).toBe("correct");
    expect(checkNumber("2.5e3", 2500)).toBe("correct");
  });
});

describe("checkNumber: hints", () => {
  it("opposite sign → check the direction", () => {
    expect(checkNumber("-25", 25)).toBe("sign");
    expect(checkNumber("9.8", -9.8)).toBe("sign");
  });

  it("×10, ×100, ×1000 → check the units", () => {
    expect(checkNumber("2500", 25)).toBe("units");
    expect(checkNumber("0.25", 25)).toBe("units");
    expect(checkNumber("400", 0.4)).toBe("units"); // grams instead of kg
    expect(checkNumber("250", 25)).toBe("units");
    expect(checkNumber("-2500", 25)).toBe("units");
  });

  it("anything else is simply wrong", () => {
    expect(checkNumber("26", 25)).toBe("wrong");
    expect(checkNumber("12.5", 25)).toBe("wrong");
  });

  it("unreadable input", () => {
    expect(checkNumber("twenty", 25)).toBe("invalid");
    expect(checkNumber("", 25)).toBe("invalid");
  });
});

describe("checkNumber: tolerance parts (graph reading)", () => {
  it("2% tolerance accepts close values regardless of digits", () => {
    expect(checkNumber("4.9", 5, 2)).toBe("correct");
    expect(checkNumber("5.1", 5, 2)).toBe("correct");
    expect(checkNumber("5.2", 5, 2)).toBe("wrong");
    expect(checkNumber("5", 5, 2)).toBe("correct"); // one digit is fine in tolerance mode
    expect(checkNumber("-5", 5, 2)).toBe("sign");
  });
});

describe("checkChoice", () => {
  it("compares the chosen option", () => {
    expect(checkChoice(2, 2)).toBe("correct");
    expect(checkChoice(1, 2)).toBe("wrong");
    expect(checkChoice(NaN, 2)).toBe("invalid");
  });
});
