import Token from "markdown-it/lib/token.mjs";
import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync.ts";
import { getCustomEmoji } from "@utils/emojis.ts";

const customEmojiRegex = /<a?:[^:]+:\d+>/g;

export const customEmojiPlugin = (md: MarkdownItAsync) => {
    md.core.ruler.after("emoji", "customEmoji", (state) => {
        const tokens = state.tokens;

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === "inline") {
                const content = tokens[i].content;
                const newTokens: Token[] = [];
                let lastIndex = 0;
                let match;

                customEmojiRegex.lastIndex = 0;

                while ((match = customEmojiRegex.exec(content))) {
                    if (lastIndex < match.index) {
                        const textToken = new Token("text", "", 0);
                        textToken.content = content.slice(
                            lastIndex,
                            match.index,
                        );
                        textToken.level = tokens[i].level;
                        newTokens.push(textToken);
                    }

                    const emojiToken = new Token("customEmoji", "", 0);

                    emojiToken.content = match[0];
                    emojiToken.level = tokens[i].level;
                    newTokens.push(emojiToken);

                    lastIndex = match.index + match[0].length;
                }

                if (lastIndex < content.length) {
                    const textToken = new Token("text", "", 0);
                    textToken.content = content.slice(lastIndex);
                    textToken.level = tokens[i].level;
                    newTokens.push(textToken);
                }

                if (
                    newTokens.length &&
                    newTokens.some((t) => t.type === "customEmoji")
                ) {
                    tokens[i].children = newTokens;
                    tokens[i].content = "";
                }
            }
        }
    });

    md.renderer.asyncRules.customEmoji = async (tokens, idx) => {
        const token = tokens[idx];

        const emoji = await getCustomEmoji(token.content);
        if (!emoji) return token.content;

        return `<customemoji data-name="${emoji.name}" data-url="${emoji.url}" data-id="${emoji.id}" data-animated="${emoji.animated}">${token.content}</customemoji>`;
    };
};
