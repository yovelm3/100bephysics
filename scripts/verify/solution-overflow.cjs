// Full solutions must not scroll sideways on a phone: render every calculation at phone width and list the ones that overflow.
//   node scripts/verify/solution-overflow.cjs [widthPx]
const { chromium } = require("playwright");
const katex = require("katex");
const fs = require("fs"), path = require("path");
const W = +(process.argv[2] || 290); // tex cell width on an iPhone-size screen
const breakable = (t) => t.replace(/(\\quad|,\\ )/g, "$1\\allowbreak ");
const cells = [];
for (const t of fs.readdirSync("content/bagrut")) for (const f of fs.readdirSync(path.join("content/bagrut", t)).filter((f) => f.endsWith(".json"))) {
  const e = JSON.parse(fs.readFileSync(path.join("content/bagrut", t, f), "utf8"));
  for (const p of e.parts) for (const r of p.solution) if (r.tex) cells.push({ where: `${e.source.label} ${p.label}`, html: katex.renderToString(breakable(r.tex), { throwOnError: false }) });
}
const css = fs.readFileSync(require.resolve("katex/dist/katex.min.css"), "utf8").replace(/url\([^)]*\)/g, "none");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 800 } });
  await p.setContent(`<style>${css} body{font:18px sans-serif} .c{width:${W}px;margin:4px 0;direction:ltr;text-align:left} .ltr{white-space:normal;unicode-bidi:isolate}</style>` +
    cells.map((c, i) => `<div class="c" id="c${i}"><span class="ltr">${c.html}</span></div>`).join(""));
  const over = await p.evaluate(() => [...document.querySelectorAll(".c")].map((d) => d.scrollWidth - d.clientWidth));
  const bad = over.map((o, i) => [o, i]).filter(([o]) => o > 2).sort((a, b) => b[0] - a[0]);
  for (const [o, i] of bad.slice(0, 60)) console.log(`✗ +${o}px ${cells[i].where}`);
  console.log(`${cells.length - bad.length} of ${cells.length} calculations fit · ${bad.length} too wide`);
  await b.close();
})();
