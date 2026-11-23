import type { Painter, Tone } from "@/lib/animations/engine";

/** Colors of the "mint and sun" palette; orange marks what is asked. */
export const TONES: Record<Tone, string> = {
  body: "#0f766e",
  b2: "#7c3aed",
  ask: "#c2410c",
  data: "#7f9a90",
  force: "#1d4ed8",
  vel: "#0f766e",
  idle: "#9fb8ae",
  line: "#48665a",
  soft: "#cfe9dd",
  text: "#133328",
  runner: "#2563eb",
};
const FILL_SOFT = "#e8f4ef";
const NS = "http://www.w3.org/2000/svg";
type Attrs = Record<string, string | number>;

/** Draws one frame into the SVG. World coordinates: meters, y up. */
export function svgPainter(svg: SVGSVGElement, view: { x0: number; x1: number; y0: number; y1: number; w: number; h: number; fixed?: { ox: number; oy: number; k: number } }): Painter {
  const uid = svg.dataset.uid ?? "a";
  svg.innerHTML = "";
  const pad = 26;
  const fit = Math.min((view.w - 2 * pad) / (view.x1 - view.x0), (view.h - 2 * pad) / (view.y1 - view.y0));
  const k = view.fixed?.k ?? fit;
  const ox = view.fixed ? view.fixed.ox : pad + ((view.w - 2 * pad) - k * (view.x1 - view.x0)) / 2 - view.x0 * k;
  const oy = view.fixed ? view.fixed.oy : view.h - pad - ((view.h - 2 * pad) - k * (view.y1 - view.y0)) / 2 + view.y0 * k;
  const sx = (x: number) => ox + x * k;
  const sy = (y: number) => oy - y * k;
  const col = (t?: Tone | "none", d: Tone = "line") => (t === "none" ? "none" : TONES[t ?? d]);

  const el = (tag: string, attrs: Attrs = {}, text?: string) => {
    const e = document.createElementNS(NS, tag);
    for (const [a, v] of Object.entries(attrs)) e.setAttribute(a, String(v));
    if (text !== undefined) e.textContent = text;
    svg.appendChild(e);
    return e;
  };
  const defs = el("defs");
  for (const tone of Object.keys(TONES) as Tone[]) {
    const mk = document.createElementNS(NS, "marker");
    Object.entries({ id: `${uid}-${tone}`, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" }).forEach(([a, v]) => mk.setAttribute(a, String(v)));
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", "M0,0 L10,5 L0,10 z");
    p.setAttribute("fill", TONES[tone]);
    mk.appendChild(p);
    defs.appendChild(mk);
  }
  const font = { mono: "var(--font-mono), ui-monospace, monospace", heb: "var(--font-hebrew), Arial, sans-serif" };
  const textPx = (x: number, y: number, text: string, o: { tone?: Tone; size?: number; anchor?: "start" | "middle" | "end"; heb?: boolean; weight?: number } = {}) => {
    const attrs: Attrs = { x, y, fill: col(o.tone, "text"), "font-size": Math.round((o.size ?? 13) * 1.2), "text-anchor": o.anchor ?? "middle", "font-family": o.heb ? font.heb : font.mono, "font-weight": o.weight ?? (o.heb ? 700 : 600) };
    attrs.direction = o.heb ? "rtl" : "ltr";
    // a light halo so labels stay readable over lines
    el("text", { ...attrs, stroke: "#ffffff", "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, text);
  };
  const arrowScreen = (x1: number, y1: number, x2: number, y2: number, o: { tone?: Tone; w?: number; both?: boolean } = {}) => {
    const tone = o.tone ?? "force";
    el("line", { x1, y1, x2, y2, stroke: TONES[tone], "stroke-width": o.w ?? 2.6, "marker-end": `url(#${uid}-${tone})`, ...(o.both ? { "marker-start": `url(#${uid}-${tone})` } : {}) });
  };

  const P: Painter = {
    sx,
    sy,
    line: (x1, y1, x2, y2, o = {}) => { el("line", { x1: sx(x1), y1: sy(y1), x2: sx(x2), y2: sy(y2), stroke: col(o.tone), "stroke-width": o.w ?? 2, ...(o.dash ? { "stroke-dasharray": o.dash } : {}) }); },
    poly: (pts, o = {}) => {
      const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${sx(x)},${sy(y)}`).join(" ") + (o.close === false ? "" : " Z");
      el("path", { d, fill: o.fill === undefined ? FILL_SOFT : col(o.fill), stroke: col(o.tone), "stroke-width": o.w ?? 1.8, ...(o.dash ? { "stroke-dasharray": o.dash } : {}) });
    },
    circle: (x, y, r, o = {}) => { el("circle", { cx: sx(x), cy: sy(y), r, fill: o.fill === undefined ? TONES.body : col(o.fill), stroke: o.tone ? TONES[o.tone] : "none", "stroke-width": o.w ?? 1.6, ...(o.dash ? { "stroke-dasharray": o.dash } : {}) }); },
    ring: (x, y, r, o = {}) => { el("circle", { cx: sx(x), cy: sy(y), r: r * k, fill: "none", stroke: col(o.tone), "stroke-width": o.w ?? 2, ...(o.dash ? { "stroke-dasharray": o.dash } : {}) }); },
    ground: (y, x1, x2) => {
      el("line", { x1: sx(x1), y1: sy(y), x2: sx(x2), y2: sy(y), stroke: TONES.line, "stroke-width": 2 });
      for (let x = sx(x1) + 10; x < sx(x2); x += 12) el("line", { x1: x, y1: sy(y), x2: x - 7, y2: sy(y) + 7, stroke: TONES.soft, "stroke-width": 1.2 });
    },
    wall: (x, y1, y2, side) => {
      el("line", { x1: sx(x), y1: sy(y1), x2: sx(x), y2: sy(y2), stroke: TONES.line, "stroke-width": 2.4 });
      const s = side === "left" ? -1 : 1;
      for (let y = sy(y2) + 6; y < sy(y1); y += 10) el("line", { x1: sx(x), y1: y, x2: sx(x) + 7 * s, y2: y + 6, stroke: TONES.soft, "stroke-width": 1.2 });
    },
    ball: (x, y, o = {}) => {
      const r = o.rPx ?? 7;
      el("circle", { cx: sx(x), cy: sy(y) - r, r, fill: TONES[o.tone ?? "body"] });
      if (o.label) textPx(sx(x), sy(y) - 2 * r - 6, o.label, { tone: o.tone ?? "body", size: 12 });
    },
    block: (x, y, o = {}) => {
      const w = o.wPx ?? 30, h = o.hPx ?? 22, a = o.angle ?? 0;
      // (x, y) is the middle of the base when base is set, otherwise the center
      const cx = sx(x), cy = sy(y) - (o.base === false ? 0 : h / 2);
      const g = el("g", { transform: `rotate(${(-a * 180) / Math.PI} ${sx(x)} ${sy(y)})` });
      const r = document.createElementNS(NS, "rect");
      Object.entries({ x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 3, fill: TONES[o.tone ?? "body"] }).forEach(([q, v]) => r.setAttribute(q, String(v)));
      g.appendChild(r);
      if (o.label) {
        const tx = document.createElementNS(NS, "text");
        Object.entries({ x: cx, y: cy + 4.5, fill: "#ffffff", "font-size": 12, "text-anchor": "middle", "font-family": font.mono, "font-weight": 700 }).forEach(([q, v]) => tx.setAttribute(q, String(v)));
        tx.textContent = o.label;
        g.appendChild(tx);
      }
    },
    cart: (x, y, o = {}) => {
      const w = o.wPx ?? 44, cx = sx(x), b = sy(y);
      el("rect", { x: cx - w / 2, y: b - 22, width: w, height: 15, rx: 3, fill: TONES[o.tone ?? "body"] });
      for (const dx of [-w / 3, w / 3]) el("circle", { cx: cx + dx, cy: b - 4, r: 4, fill: "#ffffff", stroke: TONES.line, "stroke-width": 1.6 });
      if (o.label) textPx(cx, b - 11, o.label, { tone: "text", size: 11 });
    },
    person: (x, y, t, o = {}) => {
      const c = TONES[o.tone ?? "runner"], px = sx(x), b = sy(y), sw = o.moving ? Math.sin(t * 40) * 7 : 0;
      el("circle", { cx: px, cy: b - 34, r: 6, fill: "none", stroke: c, "stroke-width": 2.2 });
      el("line", { x1: px, y1: b - 28, x2: px, y2: b - 12, stroke: c, "stroke-width": 2.2 });
      el("line", { x1: px, y1: b - 12, x2: px - 6 - sw, y2: b, stroke: c, "stroke-width": 2.2 });
      el("line", { x1: px, y1: b - 12, x2: px + 6 + sw, y2: b, stroke: c, "stroke-width": 2.2 });
      el("line", { x1: px - 8, y1: b - 22 + sw * 0.4, x2: px + 8, y2: b - 22 - sw * 0.4, stroke: c, "stroke-width": 2.2 });
    },
    spring: (x1, y1, x2, y2, o = {}) => {
      const a = [sx(x1), sy(y1)], b = [sx(x2), sy(y2)];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      const n = o.coils ?? 8, amp = o.ampPx ?? 6, lead = Math.min(8, L / 6);
      const pts: [number, number][] = [[a[0], a[1]], [a[0] + ux * lead, a[1] + uy * lead]];
      for (let i = 0; i < 2 * n; i++) {
        const f = lead + ((i + 0.5) / (2 * n)) * (L - 2 * lead), s = i % 2 ? -amp : amp;
        pts.push([a[0] + ux * f + nx * s, a[1] + uy * f + ny * s]);
      }
      pts.push([b[0] - ux * lead, b[1] - uy * lead], [b[0], b[1]]);
      el("path", { d: pts.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join(" "), fill: "none", stroke: col(o.tone), "stroke-width": 1.8 });
    },
    pulley: (x, y, r = 11) => {
      el("circle", { cx: sx(x), cy: sy(y), r, fill: FILL_SOFT, stroke: TONES.line, "stroke-width": 2 });
      el("circle", { cx: sx(x), cy: sy(y), r: 2.5, fill: TONES.line });
    },
    arrowPx: (x, y, dx, dy, o = {}) => {
      const x1 = sx(x), y1 = sy(y), x2 = x1 + dx, y2 = y1 + dy;
      if (Math.hypot(dx, dy) > 2) arrowScreen(x1, y1, x2, y2, o);
      if (o.label) {
        const L = Math.hypot(dx, dy) || 1, mid = o.labelPos === "mid";
        const lx = mid ? (x1 + x2) / 2 - (dy / L) * 12 : x2 + (dx / L) * 12, ly = mid ? (y1 + y2) / 2 + (dx / L) * 12 + 4 : y2 + (dy / L) * 12 + 4;
        textPx(lx, ly, o.label, { tone: o.tone ?? "force", size: 13, anchor: "middle", weight: 700 });
      }
    },
    arrow: (x1, y1, x2, y2, o = {}) => {
      arrowScreen(sx(x1), sy(y1), sx(x2), sy(y2), o);
      if (o.label) textPx((sx(x1) + sx(x2)) / 2, (sy(y1) + sy(y2)) / 2 - 7, o.label, { tone: o.tone ?? "force", size: 13, weight: 700 });
    },
    mono: (x, y, text, o = {}) => textPx(sx(x) + (o.dxPx ?? 0), sy(y) + (o.dyPx ?? 0), text, { tone: o.tone ?? "text", size: o.size, anchor: o.anchor, weight: o.weight }),
    heb: (x, y, text, o = {}) => textPx(sx(x) + (o.dxPx ?? 0), sy(y) + (o.dyPx ?? 0), text, { tone: o.tone ?? "text", size: o.size ?? 14, anchor: o.anchor, heb: true }),
    dim: (x1, y1, x2, y2, text, o = {}) => {
      const off = o.offPx ?? 0, tone = o.tone ?? "data";
      const horiz = Math.abs(sy(y1) - sy(y2)) < Math.abs(sx(x1) - sx(x2));
      const X1 = sx(x1) + (horiz ? 0 : -off), Y1 = sy(y1) + (horiz ? off : 0), X2 = sx(x2) + (horiz ? 0 : -off), Y2 = sy(y2) + (horiz ? off : 0);
      el("line", { x1: X1, y1: Y1, x2: X2, y2: Y2, stroke: TONES[tone], "stroke-width": 1.2, "stroke-dasharray": "4 3" });
      if (horiz) textPx((X1 + X2) / 2, Y1 - 6, text, { tone, size: 12, weight: 500 });
      else {
        const t = el("text", { x: X1 - 7, y: (Y1 + Y2) / 2, fill: TONES[tone], "font-size": 12, "text-anchor": "middle", "font-family": font.mono, "font-weight": 500, transform: `rotate(-90 ${X1 - 7} ${(Y1 + Y2) / 2})` }, text);
        void t;
      }
    },
    graph: (o) => {
      const gx = (t: number) => o.xPx + (t / o.tMax) * o.wPx;
      const gy = (v: number) => o.yPx + o.hPx - ((v - o.vMin) / (o.vMax - o.vMin)) * o.hPx;
      el("rect", { x: o.xPx, y: o.yPx, width: o.wPx, height: o.hPx, fill: "#ffffff", stroke: TONES.soft, "stroke-width": 1 });
      const zero = gy(0);
      if (zero >= o.yPx && zero <= o.yPx + o.hPx) arrowScreen(o.xPx, zero, o.xPx + o.wPx + 8, zero, { tone: "line", w: 1.3 });
      arrowScreen(o.xPx, o.yPx + o.hPx, o.xPx, o.yPx - 8, { tone: "line", w: 1.3 });
      textPx(o.xPx + o.wPx + 10, zero + 14, o.xLabel, { tone: "line", size: 11, anchor: "end" });
      textPx(o.xPx + 4, o.yPx - 10, o.yLabel, { tone: "line", size: 11, anchor: "start" });
      return { gx, gy };
    },
    path: (pts, o = {}) => { el("path", { d: pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" "), fill: "none", stroke: col(o.tone, "body"), "stroke-width": o.w ?? 2.2, ...(o.dash ? { "stroke-dasharray": o.dash } : {}) }); },
    textPx,
    arrowScreen,
  };
  return P;
}
