import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";
import { processCustomEmojiTokens } from "@mutualzz/client";
import { getCustomEmoji } from "@utils/emojis/emojis";
import { Expression } from "@stores/objects/Expression";

export const customEmojiPlugin = (md: MarkdownItAsync) => {
  md.core.ruler.after("emoji", "customEmoji", (state) => {
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type === "inline" && token.children) {
        processCustomEmojiTokens(token.children);
      }
    }
  });

  md.renderer.asyncRules.customEmoji = async (tokens, idx) => {
    const token = tokens[idx];
    const raw = token.content;

    let emoji: Expression | null = null;
    try {
      emoji = await getCustomEmoji(raw);
    } catch {}

    if (!emoji) return token.content;

    return `<customemoji data-name="${md.utils.escapeHtml(emoji.name)}" data-url="${md.utils.escapeHtml(emoji.url)}" data-id="${md.utils.escapeHtml(emoji.id)}" data-animated="${emoji.animated}"></customemoji>`;
  };
};
