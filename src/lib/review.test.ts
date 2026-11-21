import { describe, expect, it } from "vitest";
import { isKeyMismatch, reviewNote } from "./review";

describe("review notes", () => {
  it("drops the generic draft sentence", () => {
    expect(reviewNote("טיוטה: נוסח, פתרון וציור של Claude, ממתין לאישור הבעלים. סעיף ב פוצל.")).toBe("סעיף ב פוצל.");
    expect(reviewNote("טיוטה: נוסח, פתרון וציור של Claude, ממתין לאישור הבעלים.")).toBe("");
    expect(reviewNote(null)).toBe("");
  });
  it("flags disagreements with the answer key", () => {
    expect(isKeyMismatch("טיוטה: נוסח, פתרון וציור של Claude, ממתין לאישור הבעלים. אי-התאמה למפתח בסעיף ב")).toBe(true);
    expect(isKeyMismatch("סעיף ד: במפתח 38, החישוב נותן 38.99")).toBe(true);
    expect(isKeyMismatch("סעיף ב פוצל לב1 וב2.")).toBe(false);
  });
});
