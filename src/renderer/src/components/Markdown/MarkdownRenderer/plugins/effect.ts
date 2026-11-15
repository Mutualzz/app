import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";
import { processEffectTokens } from "@mutualzz/client";

export const effectPlugin = (md: MarkdownItAsync) => {
  md.core.ruler.after("color", "effect", (state) => {
    for (const token of state.tokens) {
      if (token.type === "inline" && token.children) {
        processEffectTokens(token.children);
      }
    }
  });

  md.renderer.rules.effect_open = (tokens, idx) => {
    const effect = tokens[idx].attrGet("effect") ?? "";
    return `<span data-markdown-effect="${md.utils.escapeHtml(effect)}">`;
  };

  md.renderer.rules.effect_close = () => `</span>`;
};
