import { describe, expect, it } from "vitest";
import { isKeyMismatch, reviewNote } from "./review";

describe("review notes", () => {
  it("drops the generic draft sentence", () => {
    expect(reviewNote("טיוטה: נוסח, פתרון וציור של Claude, ממתין לאישור הבעלים. סעיף ב פוצל.")).toBe("סעיף ב פוצל.");
    expect(reviewNote("טיוטה: נוסח, פתרון וציור של Claude, ממתין לאישור הבעלים.")).toBe("");
    expect(reviewNote(null)).toBe("");
  });
  it("flags notes that need the owner's judgement", () => {
    expect(isKeyMismatch("טיוטה: נוסח, פתרון וציור של Claude, ממתין לאישור הבעלים. אי-התאמה לדף התשובות, בסעיף ב")).toBe(true);
    expect(isKeyMismatch("הבדל קטן מדף התשובות, בסעיף ד")).toBe(true);
    expect(isKeyMismatch("צריך החלטה שלך, בסעיף ג")).toBe(true);
    expect(isKeyMismatch("הנחה שלי.\nהזווית נמדדת מהקיר. כך יוצאת התשובה בדף התשובות.")).toBe(false);
    expect(isKeyMismatch("סעיף ב פוצל לב1 וב2.")).toBe(false);
  });
});
