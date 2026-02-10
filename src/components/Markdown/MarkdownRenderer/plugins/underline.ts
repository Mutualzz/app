import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token.mjs";

function processUnderline(tokens: Token[]) {
    const regex = /__([^_]+?)__/g;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === "text" && token.content.includes("__")) {
            let lastIndex = 0;
            let match;
            const content = token.content;
            const newTokens: Token[] = [];
            regex.lastIndex = 0;
            while ((match = regex.exec(content))) {
                if (match.index > lastIndex) {
                    const textToken = new Token("text", "", 0);
                    textToken.content = content.slice(lastIndex, match.index);
                    textToken.level = token.level;
                    newTokens.push(textToken);
                }
                const underlineToken = new Token("underline", "", 0);
                underlineToken.content = match[1];
                underlineToken.level = token.level;
                newTokens.push(underlineToken);
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < content.length) {
                const textToken = new Token("text", "", 0);
                textToken.content = content.slice(lastIndex);
                textToken.level = token.level;
                newTokens.push(textToken);
            }
            if (newTokens.length > 0) {
                tokens.splice(i, 1, ...newTokens);
                i += newTokens.length - 1;
            }
        } else if (token.children) {
            processUnderline(token.children);
        }
    }
}

export const underlinePlugin = (md: MarkdownIt) => {
    md.core.ruler.after("inline", "underline", (state) => {
        for (let i = 0; i < state.tokens.length; i++) {
            const token = state.tokens[i];
            if (token.type === "inline" && token.children) {
                processUnderline(token.children);
            }
        }
    });

    md.renderer.rules.underline = (tokens, idx) => {
        const token = tokens[idx];
        return `<u>${md.utils.escapeHtml(token.content)}</u>`;
    };
};
