/**
 * Answer checking (server only — the correct value never reaches the browser).
 *
 * Rules (owner's decisions):
 * - Accept "." or "," as decimal point, and scientific notation: 4×10³, 4*10^3, 4x10^3, 4e3, 4E-3.
 * - Exact check by significant figures: the answer is correct if it equals the exact value
 *   rounded to the number of significant figures the student wrote. At least 2 are required.
 *   Example: exact 27.39 → "27.4" and "27" are correct, "28" is not.
 * - Fewer than 2 significant figures → a message, not counted as a wrong attempt.
 * - Parts marked with a tolerance (graph reading, rounded intermediates) use a relative tolerance instead.
 * - Right size, wrong sign → "check the direction". Off by exactly ×10, ×100, ×1000 → "check the units".
 */

export type CheckResult = "correct" | "wrong" | "sign" | "units" | "too_few_digits" | "invalid";

export type Parsed = { value: number; sigFigs: number };

const SUPERSCRIPTS: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+" };

/** Significant figures of a plain decimal string like "-0.0250" or "30". Trailing zeros of integers count. */
export function countSigFigs(mantissa: string): number {
  const digits = mantissa.replace(/^[+-]/, "").replace(".", "");
  const stripped = digits.replace(/^0+/, "");
  return stripped.length === 0 ? (digits.length > 0 ? 1 : 0) : stripped.length;
}

/** Parses what a student typed. Returns null when it is not a number. */
export function parseAnswer(raw: string): Parsed | null {
  let s = raw.trim().replace(/\s+/g, "").replace(/[−–—]/g, "-");
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (m) => "^" + [...m].map((c) => SUPERSCRIPTS[c]).join(""));
  if (!s) return null;

  // mantissa  [ (×|x|X|*|·) 10 ^ exp  |  e exp ]
  const m = s.match(/^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))(?:(?:[×xX*·]10\^?([+-]?\d+))|(?:[eE]([+-]?\d+)))?$/);
  if (!m) {
    // a bare power of ten: 10^3, 10³
    const p = s.match(/^([+-]?)10\^([+-]?\d+)$/);
    if (!p) return null;
    return { value: Number(`${p[1]}1e${p[2]}`), sigFigs: 1 };
  }
  const mantissa = m[1].replace(",", ".");
  const exp = m[2] ?? m[3];
  const value = Number(exp !== undefined ? `${mantissa}e${exp}` : mantissa);
  if (!Number.isFinite(value)) return null;
  return { value, sigFigs: countSigFigs(mantissa) };
}

/** Rounds x to n significant figures. */
export function roundSig(x: number, n: number): number {
  if (x === 0) return 0;
  return Number(x.toPrecision(n));
}

function nearlyEqual(a: number, b: number) {
  return Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b), 1e-300);
}

/** Does the student's value match the exact one, by the significant-figures rule or the tolerance? */
function matches(student: Parsed, exact: number, tolerancePct: number | null): boolean {
  if (tolerancePct != null) {
    if (exact === 0) return Math.abs(student.value) < 1e-9;
    return Math.abs(student.value - exact) / Math.abs(exact) <= tolerancePct / 100 + 1e-12;
  }
  return nearlyEqual(roundSig(exact, student.sigFigs), student.value);
}

export function checkNumber(raw: string, exact: number, tolerancePct: number | null = null): CheckResult {
  const p = parseAnswer(raw);
  if (!p) return "invalid";
  if (tolerancePct == null && p.sigFigs < 2 && p.value !== 0) return "too_few_digits";
  if (matches(p, exact, tolerancePct)) return "correct";
  if (exact !== 0 && matches({ ...p, value: -p.value }, exact, tolerancePct)) return "sign";
  for (const k of [10, 100, 1000]) {
    for (const f of [k, 1 / k]) {
      for (const sign of [1, -1]) {
        if (exact !== 0 && matches({ ...p, value: sign * p.value * f }, exact, tolerancePct)) return "units";
      }
    }
  }
  return "wrong";
}

export function checkChoice(selected: number, correct: number): CheckResult {
  return Number.isInteger(selected) ? (selected === correct ? "correct" : "wrong") : "invalid";
}

/** Results that count as an attempt (too few digits / unreadable input do not). */
export const COUNTED: CheckResult[] = ["correct", "wrong", "sign", "units"];

export const MESSAGES: Record<CheckResult, string> = {
  correct: "נכון!",
  wrong: "לא נכון. אפשר לנסות שוב או לפתוח את הפתרון המלא.",
  sign: "בדוק את הכיוון: הגודל נכון, אבל הסימן הפוך.",
  units: "בדוק את היחידות: התשובה גדולה או קטנה פי 10, 100 או 1000.",
  too_few_digits: "כתוב לפחות 2 ספרות משמעותיות (למשל 27 ולא 30).",
  invalid: "לא הצלחנו לקרוא את המספר. אפשר לכתוב למשל 25, 2.5 או 4×10³.",
};
