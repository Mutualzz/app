import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";
import { processLinkTokens } from "@mutualzz/client";

export const linkPlugin = (md: MarkdownItAsync) => {
  md.core.ruler.after("inline", "link", (state) => {
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type === "inline" && token.children) {
        processLinkTokens(token.children);
      }
    }
  });

  md.renderer.rules.link = (tokens, idx) => {
    const token = tokens[idx];
    const href = token.attrGet("href");
    return `<a href="${md.utils.escapeHtml(href ?? "")}" target="_blank" rel="noopener noreferrer">${md.utils.escapeHtml(token.content)}</a>`;
  };
};
