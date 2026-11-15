import katex from "katex";

/** Renders a LaTeX formula on the server. Always left-to-right. */
export function Math({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, { displayMode: block, throwOnError: false, output: "html" });
  return block ? (
    <div className="ltr" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className="ltr" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
