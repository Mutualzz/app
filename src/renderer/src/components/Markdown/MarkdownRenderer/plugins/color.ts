import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";
import { processColorTokens } from "@mutualzz/client";

export const colorPlugin = (md: MarkdownItAsync) => {
  md.core.ruler.after("inline", "color", (state) => {
    for (const token of state.tokens) {
      if (token.type === "inline" && token.children) {
        processColorTokens(token.children);
      }
    }
  });

  md.renderer.rules.color_open = (tokens, idx) => {
    const color = tokens[idx].attrGet("color") ?? "";
    return `<span data-markdown-color="${md.utils.escapeHtml(color)}">`;
  };

  md.renderer.rules.color_close = () => `</span>`;
};
