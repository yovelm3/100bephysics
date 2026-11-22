/** A plain-text version of a label that may contain $LaTeX$, for screen readers (aria-label cannot hold formulas). */
export function speakable(s: string): string {
  return s
    .replace(/\$/g, "")
    .replace(/\\t?frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2")
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(/\\[,;:! ]|\\quad|\\qquad/g, " ")
    .replace(/\\cdot/g, "·")
    .replace(/\\circ/g, "°")
    .replace(/\\([a-zA-Z]+)/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/\^/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
