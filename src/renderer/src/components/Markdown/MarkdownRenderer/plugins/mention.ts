import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";
import { processMentionTokens } from "@mutualzz/client";

export const mentionPlugin = (md: MarkdownItAsync) => {
  md.core.ruler.after("inline", "mention", (state) => {
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type === "inline" && token.children) {
        processMentionTokens(token.children);
      }
    }
  });

  md.renderer.rules.mention = (tokens, idx) => {
    const token = tokens[idx];
    const type = token.attrGet("type") ?? "user";
    const id = token.attrGet("id") ?? "";
    return `<mention data-type="${md.utils.escapeHtml(type)}" data-id="${md.utils.escapeHtml(id)}">${md.utils.escapeHtml(token.content)}</mention>`;
  };
};
