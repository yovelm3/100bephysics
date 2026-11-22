/** The generic draft sentence every imported exercise starts with. The owner only needs what comes after it. */
const BOILERPLATE = "טיוטה: נוסח, פתרון וציור של Claude, ממתין לאישור הבעלים.";

export function reviewNote(notes: string | null | undefined): string {
  return (notes ?? "").replace(BOILERPLATE, "").trim();
}

/**
 * Notes that need the owner's judgement: our answer differs from the answer key, or a decision is needed.
 * They start with "אי-התאמה", "הבדל" or "צריך החלטה" (the plain-Hebrew note format); older notes say "אי-התאמה" anywhere.
 */
export function isKeyMismatch(notes: string | null | undefined): boolean {
  const n = reviewNote(notes);
  return /^(אי-התאמה|הבדל|צריך החלטה)/.test(n) || n.includes("אי-התאמה");
}
