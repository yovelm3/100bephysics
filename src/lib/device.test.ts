import { describe, expect, it } from "vitest";
import { describeUserAgent, isValidDeviceKey, newDeviceKey, resolveDeviceKey } from "./device";

describe("device keys", () => {
  it("new keys are valid and unique", () => {
    const a = newDeviceKey();
    const b = newDeviceKey();
    expect(isValidDeviceKey(a)).toBe(true);
    expect(a).not.toBe(b);
  });

  it("rejects junk", () => {
    for (const k of [undefined, null, "", "short", "has spaces in it......", "x".repeat(65), 123]) {
      expect(isValidDeviceKey(k)).toBe(false);
    }
  });

  it("cookie wins over backup", () => {
    const c = newDeviceKey();
    const b = newDeviceKey();
    expect(resolveDeviceKey(c, b)).toEqual({ key: c, isNew: false });
  });

  it("restores from localStorage backup when the cookie is gone", () => {
    const b = newDeviceKey();
    expect(resolveDeviceKey(undefined, b)).toEqual({ key: b, isNew: false });
  });

  it("creates a new key when both are missing or invalid", () => {
    const r = resolveDeviceKey("bad", "also bad");
    expect(r.isNew).toBe(true);
    expect(isValidDeviceKey(r.key)).toBe(true);
  });
});

describe("describeUserAgent", () => {
  const cases: [string, string, string][] = [
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", "Safari", "iOS"],
    ["Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36", "Chrome", "Android"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0", "Edge", "Windows"],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0", "Firefox", "macOS"],
    ["Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0 Mobile Safari/537.36", "Samsung Internet", "Android"],
  ];
  it.each(cases)("%s", (ua, browser, os) => {
    expect(describeUserAgent(ua)).toEqual({ browser, os });
  });
});
