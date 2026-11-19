// Second pass, check 3: lay out every figure in a real browser and flag text that overlaps other text
// or spills outside the drawing.   node scripts/verify/figure-check.cjs [topic]
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const base = "content/bagrut", only = process.argv[2];
const css = fs.readFileSync("src/app/globals.css", "utf8").match(/\.fig[\s\S]*$/m)?.[0] || "";
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 800 } });
  let bad = 0, n = 0;
  for (const t of fs.readdirSync(base)) {
    if (only && t !== only) continue;
    for (const f of fs.readdirSync(path.join(base, t)).filter(f => f.endsWith(".svg"))) {
      n++;
      const svg = fs.readFileSync(path.join(base, t, f), "utf8");
      await p.setContent(`<html dir="rtl"><head><style>body{font-family:Heebo,sans-serif} ${css}</style></head><body><div class="fig ltr" style="width:640px;direction:ltr;unicode-bidi:isolate">${svg}</div></body></html>`);
      const r = await p.evaluate(() => {
        const s = document.querySelector("svg"), sb = s.getBoundingClientRect(), out = [];
        const ts = [...s.querySelectorAll("text")].map(e => ({ t: e.textContent, b: e.getBoundingClientRect() })).filter(x => x.t.trim());
        for (const x of ts) if (x.b.left < sb.left - 2 || x.b.right > sb.right + 2 || x.b.top < sb.top - 2 || x.b.bottom > sb.bottom + 2) out.push(`outside: "${x.t}"`);
        for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
          const a = ts[i].b, c = ts[j].b;
          const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
          if (ox > 3 && oy > 3) out.push(`overlap: "${ts[i].t}" / "${ts[j].t}"`);
        }
        return out;
      });
      if (r.length) { bad++; console.log(`✗ ${t}/${f}: ${r.slice(0, 4).join(" · ")}`); }
    }
  }
  console.log(`${n - bad} figures clean · ${bad} to look at`);
  await b.close();
})();
