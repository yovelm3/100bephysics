/** Device identification: a stable random key per browser, kept in an httpOnly cookie and backed up in localStorage. */

export const DEVICE_COOKIE = "bp_device";
export const DEVICE_STORAGE_KEY = "bp_device";
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // 400 days, the browser maximum

const KEY_RE = /^[A-Za-z0-9_-]{16,64}$/;

export function isValidDeviceKey(key: unknown): key is string {
  return typeof key === "string" && KEY_RE.test(key);
}

export function newDeviceKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

/**
 * Picks the device key for a request: the cookie wins, then the localStorage backup,
 * otherwise a fresh key (a new device).
 */
export function resolveDeviceKey(cookieKey: unknown, backupKey: unknown): { key: string; isNew: boolean } {
  if (isValidDeviceKey(cookieKey)) return { key: cookieKey, isNew: false };
  if (isValidDeviceKey(backupKey)) return { key: backupKey, isNew: false };
  return { key: newDeviceKey(), isNew: true };
}

/** Rough browser and OS names from a User-Agent string, for the admin's device list. */
export function describeUserAgent(ua: string | null | undefined): { browser: string; os: string } {
  const s = ua ?? "";
  let os = "לא ידוע";
  if (/iPhone|iPad|iPod/.test(s)) os = /iPad/.test(s) ? "iPadOS" : "iOS";
  else if (/Android/.test(s)) os = "Android";
  else if (/Windows NT/.test(s)) os = "Windows";
  else if (/CrOS/.test(s)) os = "ChromeOS";
  else if (/Mac OS X|Macintosh/.test(s)) os = "macOS";
  else if (/Linux/.test(s)) os = "Linux";

  let browser = "לא ידוע";
  if (/SamsungBrowser\//.test(s)) browser = "Samsung Internet";
  else if (/Edg(e|A|iOS)?\//.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/.test(s)) browser = "Opera";
  else if (/Firefox\/|FxiOS\//.test(s)) browser = "Firefox";
  else if (/Chrome\/|CriOS\//.test(s)) browser = "Chrome";
  else if (/Safari\//.test(s)) browser = "Safari";

  return { browser, os };
}
