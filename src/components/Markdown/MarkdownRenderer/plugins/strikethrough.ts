import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token.mjs";

function processStrikethrough(tokens: Token[]) {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === "text" && token.content.includes("~~")) {
            const parts = token.content.split(/(~~)/);
            const newTokens: Token[] = [];
            let strikeOpen = false;
            for (const part of parts) {
                if (part === "~~") strikeOpen = !strikeOpen;
                else if (strikeOpen && part) {
                    const strikeToken = new Token("strikethrough", "", 0);
                    strikeToken.content = part;
                    strikeToken.level = token.level;
                    newTokens.push(strikeToken);
                } else if (part) {
                    const textToken = new Token("text", "", 0);
                    textToken.content = part;
                    textToken.level = token.level;
                    newTokens.push(textToken);
                }
            }
            tokens.splice(i, 1, ...newTokens);
            i += newTokens.length - 1;
        } else if (token.children) {
            processStrikethrough(token.children);
        }
    }
}

export const strikethroughPlugin = (md: MarkdownIt) => {
    md.core.ruler.after("inline", "strikethrough", (state) => {
        for (let i = 0; i < state.tokens.length; i++) {
            const token = state.tokens[i];
            if (token.type === "inline" && token.children) {
                processStrikethrough(token.children);
            }
        }
    });

    md.renderer.rules.strikethrough = (tokens, idx) => {
        const token = tokens[idx];
        return `<del>${md.utils.escapeHtml(token.content)}</del>`;
    };
};
