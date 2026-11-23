import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { verifySpec } from "./engine";
import { SPECS } from "./q";

const files = Object.fromEntries(
  ["bagrut", "mechina"].flatMap((pool) => {
    try { return readdirSync(join("content", pool)).flatMap((topic) => readdirSync(join("content", pool, topic)).filter((f) => f.endsWith(".json")).map((f) => join("content", pool, topic, f))); } catch { return []; }
  }).map((f) => {
    const j = JSON.parse(readFileSync(f, "utf8"));
    return [j.id as string, j as { parts: { label: string }[] }];
  }),
);

describe("animations: two independent builds must agree, event by event and in order", () => {
  for (const [id, load] of Object.entries(SPECS)) {
    it(id, async () => {
      const { spec } = await load();
      expect(spec.id).toBe(id);
      const ex = files[id];
      expect(ex, "exercise file").toBeTruthy();
      const labels = [...new Set(ex.parts.map((p: { label: string }) => p.label))];
      expect(spec.parts.length, "one animated window per part").toBe(labels.length);
      const v = verifySpec(spec);
      expect(v.problems).toEqual([]);
      expect(v.allOk).toBe(true);
      // every part has a non-empty window
      for (const p of spec.parts) {
        const a = p.from ? p.from(v.A) : 0, b = p.to(v.A);
        expect(Number.isFinite(a) && Number.isFinite(b) && b > a).toBe(true);
      }
    });
  }
});
