import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token.mjs";

function processEmphasis(tokens: Token[]) {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === "text") {
            // Bold
            const boldRegex = /\*\*([^*]+?)\*\*/g;
            let lastIndex = 0;
            let match;
            const content = token.content;
            const newTokens: Token[] = [];
            boldRegex.lastIndex = 0;
            while ((match = boldRegex.exec(content))) {
                if (match.index > lastIndex) {
                    const textToken = new Token("text", "", 0);
                    textToken.content = content.slice(lastIndex, match.index);
                    textToken.level = token.level;
                    newTokens.push(textToken);
                }
                const boldToken = new Token("strong", "", 0);
                boldToken.content = match[1];
                boldToken.level = token.level;
                newTokens.push(boldToken);
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
            processEmphasis(token.children);
        }
    }
    // Italic *
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === "text") {
            const italicRegex = /\*([^*]+?)\*/g;
            let lastIndex = 0;
            let match;
            const content = token.content;
            const newTokens: Token[] = [];
            italicRegex.lastIndex = 0;
            while ((match = italicRegex.exec(content))) {
                if (match.index > lastIndex) {
                    const textToken = new Token("text", "", 0);
                    textToken.content = content.slice(lastIndex, match.index);
                    textToken.level = token.level;
                    newTokens.push(textToken);
                }
                const italicToken = new Token("em", "", 0);
                italicToken.content = match[1];
                italicToken.level = token.level;
                newTokens.push(italicToken);
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
            processEmphasis(token.children);
        }
    }
    // Italic _
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === "text") {
            const underlineRegex = /_([^_]+?)_/g;
            let lastIndex = 0;
            let match;
            const content = token.content;
            const newTokens: Token[] = [];
            underlineRegex.lastIndex = 0;
            while ((match = underlineRegex.exec(content))) {
                if (match.index > lastIndex) {
                    const textToken = new Token("text", "", 0);
                    textToken.content = content.slice(lastIndex, match.index);
                    textToken.level = token.level;
                    newTokens.push(textToken);
                }
                const italicToken = new Token("em", "", 0);
                italicToken.content = match[1];
                italicToken.level = token.level;
                newTokens.push(italicToken);
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
            processEmphasis(token.children);
        }
    }
}

export const emphasisPlugin = (md: MarkdownIt) => {
    md.core.ruler.after("inline", "emphasis", (state) => {
        for (let i = 0; i < state.tokens.length; i++) {
            const token = state.tokens[i];
            if (token.type === "inline" && token.children) {
                processEmphasis(token.children);
            }
        }
    });

    md.renderer.rules.strong = (tokens, idx) => {
        const token = tokens[idx];
        return `<strong>${md.utils.escapeHtml(token.content)}</strong>`;
    };

    md.renderer.rules.em = (tokens, idx) => {
        const token = tokens[idx];
        return `<em>${md.utils.escapeHtml(token.content)}</em>`;
    };
};
