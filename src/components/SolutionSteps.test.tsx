import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { loadContent } from "@/lib/content/load";
import { InlineText, SolutionSteps } from "./SolutionSteps";

describe("every solution in content/ renders", () => {
  const { exercises } = loadContent(path.resolve(__dirname, "../../content"));
  for (const { exercise } of exercises) {
    for (const part of exercise.parts) {
      it(`${exercise.id} part ${part.label}`, () => {
        const html = renderToStaticMarkup(<SolutionSteps steps={part.solution} />);
        for (const step of part.solution) {
          if ("what" in step) expect(html).toContain("katex"); // formulas rendered
        }
        expect(html.length).toBeGreaterThan(100);
        expect(renderToStaticMarkup(<InlineText text={part.finalAnswer} />).length).toBeGreaterThan(0);
      });
    }
  }
});

describe("breakable", () => {
  it("lets long lists wrap after separators", async () => {
    const { breakable } = await import("./SolutionSteps");
    expect(breakable(String.raw`a,\ b\quad c`)).toBe(String.raw`a,\ \allowbreak b\quad\allowbreak  c`);
  });
});
