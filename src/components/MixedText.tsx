/** Hebrew text with embedded numbers, units and formulas (e.g. "במפתח 4.4·10^7 m"): each Latin/number run is isolated left-to-right. */
const RUN = /([0-9A-Za-zα-ωΔ√][0-9A-Za-zα-ωΔ√·^.,=()/_\-+×%°²³'*]*(?: +[0-9A-Za-zα-ωΔ√·^.,=()/_\-+×%°²³'*]+)*)/g;

/** Splits text into [plain, ltr, plain, ltr, ...]. Sentence punctuation at the end of a run (".", ",", ")") stays with the Hebrew. */
export function splitRuns(text: string): string[] {
  const out: string[] = [];
  text.split(RUN).forEach((s, i) => {
    if (i % 2 === 0) {
      if (out.length % 2 === 0) out.push(s);
      else out[out.length - 1] += s;
      return;
    }
    let run = s;
    let tail = "";
    while (/[.,)]$/.test(run) && !(run.endsWith(")") && run.split("(").length > run.split(")").length - 1)) {
      tail = run.slice(-1) + tail;
      run = run.slice(0, -1);
    }
    out.push(run, tail);
  });
  return out;
}

export function MixedText({ text }: { text: string }) {
  return (
    <>
      {splitRuns(text).map((s, i) =>
        i % 2 ? (
          <bdi key={i} dir="ltr">
            {s}
          </bdi>
        ) : (
          s
        ),
      )}
    </>
  );
}
