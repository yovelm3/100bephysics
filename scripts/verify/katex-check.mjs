// Second pass, check 2: every formula in every exercise must render in KaTeX without errors.
//   node scripts/verify/katex-check.mjs
import katex from "katex";
import fs from "node:fs";
import path from "node:path";
const base = "content/bagrut";
let n = 0, bad = 0;
const tryTex = (tex, where) => {
  n++;
  try { katex.renderToString(tex, { throwOnError: true, strict: "ignore" }); }
  catch (e) { bad++; console.log(`✗ ${where}: ${String(e.message).slice(0, 120)} :: ${tex.slice(0, 80)}`); }
};
const inline = (s, where) => {
  const parts = String(s || "").split("$");
  if (parts.length % 2 === 0) { bad++; console.log(`✗ ${where}: odd number of $`); return; }
  for (let i = 1; i < parts.length; i += 2) tryTex(parts[i], where);
};
for (const t of fs.readdirSync(base)) for (const f of fs.readdirSync(path.join(base, t))) {
  if (!f.endsWith(".json")) continue;
  const e = JSON.parse(fs.readFileSync(path.join(base, t, f), "utf8"));
  const L = e.source?.label || f;
  inline(e.stem, `${L} stem`); inline(e.summary, `${L} summary`);
  for (const p of e.parts) {
    const W = `${L} ${p.label}`;
    inline(p.question, `${W} q`); inline(p.finalAnswer, `${W} final`);
    for (const o of p.answer.options || []) inline(o, `${W} option`);
    for (const r of p.solution || []) {
      if (r.tex) tryTex(r.tex, `${W} tex`);
      for (const k of ["what", "why", "explain"]) if (r[k]) inline(r[k], `${W} ${k}`);
    }
  }
}
console.log(`${n - bad} formulas render · ${bad} errors`);
