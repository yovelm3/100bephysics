/** Our own SVG drawings only: no scripts, event handlers, external references or foreign objects. */
export function checkSvg(svg: string): string | null {
  if (!/^\s*<svg[\s>]/.test(svg)) return "must start with <svg";
  if (/<script|<foreignObject|\son[a-z]+\s*=|javascript:|xlink:href\s*=\s*["']https?:|href\s*=\s*["']https?:/i.test(svg)) return "contains scripts, handlers or external links";
  if (!/viewBox=/.test(svg)) return "needs a viewBox";
  return null;
}
