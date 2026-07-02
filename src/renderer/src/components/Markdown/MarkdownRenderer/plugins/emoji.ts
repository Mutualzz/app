import { getEmoji } from "@utils/emojis/emojis";
import { TWEMOJI_URL } from "@utils/urls";
import shortcodeRegex from "emojibase-regex/shortcode";
import Token from "markdown-it/lib/token.mjs";
import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";

const emojiRegex = new RegExp(shortcodeRegex.source, "g");

const UNICODE_EMOJI_BETWEEN_COLONS =
  /:([\p{Extended_Pictographic}\u200d\ufe0f]+):/gu;

const normalizeUnicodeEmojiColons = (content: string) =>
  content.replace(UNICODE_EMOJI_BETWEEN_COLONS, "$1");

function processEmojiTokens(tokens: Token[]) {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "text") {
      const content = normalizeUnicodeEmojiColons(token.content);
      const newTokens: Token[] = [];
      let lastIndex = 0;
      let match;

      emojiRegex.lastIndex = 0;

      while ((match = emojiRegex.exec(content))) {
        if (match.index > 0 && content[match.index - 1] === "<") {
          continue;
        }

        const emojiName = match[0].slice(1, -1);
        const emojiData = getEmoji(emojiName);

        if (emojiData) {
          if (lastIndex < match.index) {
            const textToken = new Token("text", "", 0);
            textToken.content = content.slice(lastIndex, match.index);
            textToken.level = token.level;
            newTokens.push(textToken);
          }

          const emojiToken = new Token("emoji", "", 0);
          emojiToken.content = emojiData.emoji;
          emojiToken.attrSet(
            "name",
            emojiData.shortcodes?.[0] || emojiData.emoji
          );
          emojiToken.attrSet(
            "url",
            `${TWEMOJI_URL}/${emojiData.hexcode.toLowerCase()}.svg`
          );
          emojiToken.attrSet("unicode", emojiData.emoji);
          emojiToken.level = token.level;
          newTokens.push(emojiToken);

          lastIndex = match.index + match[0].length;
        }
      }

      if (lastIndex < content.length) {
        const textToken = new Token("text", "", 0);
        textToken.content = content.slice(lastIndex);
        textToken.level = token.level;
        newTokens.push(textToken);
      }

      if (newTokens.length && newTokens.some((t) => t.type === "emoji")) {
        tokens.splice(i, 1, ...newTokens);
        i += newTokens.length - 1;
      } else if (content !== token.content) {
        token.content = content;
      }
    } else if (token.children) {
      processEmojiTokens(token.children);
    }
  }
}

export const emojiPlugin = (md: MarkdownItAsync) => {
  md.core.ruler.after("inline", "emoji", (state) => {
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type === "inline" && token.children) {
        processEmojiTokens(token.children);
      }
    }
  });

  md.renderer.rules.emoji = (tokens, idx) => {
    const token = tokens[idx];

    return `<emoji data-name="${md.utils.escapeHtml(token.attrGet("name") ?? "")}" data-url="${md.utils.escapeHtml(token.attrGet("url") ?? "")}" data-unicode="${md.utils.escapeHtml(token.attrGet("unicode") ?? "")}">${token.content}</emoji>`;
  };
};
