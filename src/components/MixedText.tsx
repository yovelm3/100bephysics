/** Hebrew text with embedded numbers, units and formulas (e.g. "במפתח 4.4·10^7 m"): each Latin/number run is isolated left-to-right. */
const RUN = /([0-9A-Za-zα-ωΔ√][0-9A-Za-zα-ωΔ√·^.,=()/_\-+×%°²³'*]*(?: +[0-9A-Za-zα-ωΔ√·^.,=()/_\-+×%°²³'*]+)*)/g;

export function MixedText({ text }: { text: string }) {
  return (
    <>
      {text.split(RUN).map((s, i) =>
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
