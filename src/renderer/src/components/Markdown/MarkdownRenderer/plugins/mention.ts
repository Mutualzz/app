import Token from "markdown-it/lib/token.mjs";
import type { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";

const mentionRegex = /<@!?(\d+)>|<@&(\d+)>|@everyone|@here/g;

/**
 * Recursively process only text tokens, leaving all other token types untouched.
 * This ensures emojis, spoilers, bold, italic, etc. are preserved.
 */
function processMentionTokens(tokens: Token[]) {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // Only process text tokens; leave everything else alone
        if (token.type === "text") {
            const content = token.content;
            let lastIndex = 0;
            let match;
            const newTokens: Token[] = [];
            mentionRegex.lastIndex = 0;

            while ((match = mentionRegex.exec(content))) {
                // Add any text before this mention
                if (match.index > lastIndex) {
                    const textToken = new Token("text", "", 0);
                    textToken.content = content.slice(lastIndex, match.index);
                    textToken.level = token.level;
                    newTokens.push(textToken);
                }

                // Create mention token
                const mentionToken = new Token("mention", "", 0);
                mentionToken.content = match[0];

                if (match[1]) {
                    mentionToken.attrSet("type", "user");
                    mentionToken.attrSet("id", match[1]);
                } else if (match[2]) {
                    mentionToken.attrSet("type", "role");
                    mentionToken.attrSet("id", match[2]);
                } else if (match[0] === "@everyone") {
                    mentionToken.attrSet("type", "everyone");
                    mentionToken.attrSet("id", "everyone");
                } else if (match[0] === "@here") {
                    mentionToken.attrSet("type", "here");
                    mentionToken.attrSet("id", "here");
                }

                mentionToken.level = token.level;
                newTokens.push(mentionToken);
                lastIndex = match.index + match[0].length;
            }

            // Add remaining text after last mention
            if (lastIndex < content.length) {
                const textToken = new Token("text", "", 0);
                textToken.content = content.slice(lastIndex);
                textToken.level = token.level;
                newTokens.push(textToken);
            }

            // Only replace token if we found mentions
            if (newTokens.length > 0) {
                tokens.splice(i, 1, ...newTokens);
                i += newTokens.length - 1;
            }
        } else if (token.children) {
            processMentionTokens(token.children);
        }
    }
}

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
