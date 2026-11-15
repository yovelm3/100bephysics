import "server-only";

/**
 * Sends an email through Resend (https://resend.com) using its HTTP API.
 * Without RESEND_API_KEY / EMAIL_FROM nothing is sent and `false` is returned.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(`[email] not configured, skipped: ${subject}`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    console.error(`[email] failed ${res.status}: ${await res.text()}`);
    return false;
  }
  return true;
}

export function rtlEmail(body: string) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#17233a">${body}</div>`;
}
