import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";

export const brOnEmpty = (md: MarkdownItAsync) => {
  md.renderer.rules.blank_line = () => "<br>";

  md.core.ruler.after("inline", "br-on-empty-lines", (state) => {
    const sourceLines = state.src.split("\n");
    const withBlankLines: typeof state.tokens = [];
    let previousBlockEnd: number | null = null;

    for (const token of state.tokens) {
      const startsTopLevelBlock =
        token.level === 0 && token.nesting !== -1 && token.map;

      if (startsTopLevelBlock && token.map) {
        const [blockStart, blockEnd] = token.map;

        if (previousBlockEnd !== null) {
          const emptyLines = blockStart - previousBlockEnd;
          for (let i = 0; i < emptyLines; i++)
            withBlankLines.push(new state.Token("blank_line", "br", 0));
        }

        let contentEnd = blockEnd;
        while (
          contentEnd > blockStart &&
          sourceLines[contentEnd - 1]?.trim() === ""
        )
          contentEnd--;

        previousBlockEnd = contentEnd;
      }

      withBlankLines.push(token);
    }

    state.tokens = withBlankLines;
  });
};
