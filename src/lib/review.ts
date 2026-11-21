/** The generic draft sentence every imported exercise starts with. The owner only needs what comes after it. */
const BOILERPLATE = "טיוטה: נוסח, פתרון וציור של Claude, ממתין לאישור הבעלים.";

export function reviewNote(notes: string | null | undefined): string {
  return (notes ?? "").replace(BOILERPLATE, "").trim();
}

/** A note that says the answer key and our solution disagree: the owner should look at these first. */
export function isKeyMismatch(notes: string | null | undefined): boolean {
  return /אי-התאמה|במפתח/.test(reviewNote(notes));
}
