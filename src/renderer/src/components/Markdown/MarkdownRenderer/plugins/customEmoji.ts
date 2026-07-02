import Token from "markdown-it/lib/token.mjs";
import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";
import { getCustomEmoji } from "@utils/emojis/emojis";
import { Expression } from "@stores/objects/Expression";

const customEmojiRegex = /<a?:[^:]+:\d+>/g;

function processCustomEmojiTokens(tokens: Token[]) {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "text") {
      const content = token.content;
      const newTokens: Token[] = [];
      let lastIndex = 0;
      let match;

      customEmojiRegex.lastIndex = 0;

      while ((match = customEmojiRegex.exec(content))) {
        if (lastIndex < match.index) {
          const textToken = new Token("text", "", 0);
          textToken.content = content.slice(lastIndex, match.index);
          textToken.level = token.level;
          newTokens.push(textToken);
        }

        const emojiToken = new Token("customEmoji", "", 0);

        emojiToken.content = match[0];
        emojiToken.level = token.level;
        newTokens.push(emojiToken);

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < content.length) {
        const textToken = new Token("text", "", 0);
        textToken.content = content.slice(lastIndex);
        textToken.level = token.level;
        newTokens.push(textToken);
      }

      if (
        newTokens.length &&
        newTokens.some((t) => t.type === "customEmoji")
      ) {
        tokens.splice(i, 1, ...newTokens);
        i += newTokens.length - 1;
      }
    } else if (token.children) {
      processCustomEmojiTokens(token.children);
    }
  }
}

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
