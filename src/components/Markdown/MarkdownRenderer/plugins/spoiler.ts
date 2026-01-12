import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token.mjs";

export const spoilerPlugin = (md: MarkdownIt) => {
    md.core.ruler.after("inline", "spoiler", (state) => {
        const tokens = state.tokens;
        for (let i = 0; i < tokens.length; i++) {
            const children = tokens[i].children;
            if (tokens[i].type === "inline" && children) {
                const newChildren: Token[] = [];
                let insideSpoiler = false;
                let spoilerTokens: Token[] = [];

                for (let j = 0; j < children.length; j++) {
                    const token = children[j];

                    if (token.type === "text" && token.content.includes("||")) {
                        const parts = token.content.split("||");
                        for (let k = 0; k < parts.length; k++) {
                            if (k > 0) {
                                if (insideSpoiler) {
                                    const spoilerToken = new Token(
                                        "spoiler",
                                        "",
                                        0,
                                    );
                                    spoilerToken.children = [...spoilerTokens];
                                    spoilerToken.content = "";
                                    spoilerToken.level = token.level;
                                    spoilerToken.markup = "||";
                                    newChildren.push(spoilerToken);
                                    spoilerTokens = [];
                                }
                                insideSpoiler = !insideSpoiler;
                            }
                            if (parts[k]) {
                                const partToken = new Token(
                                    token.type,
                                    token.tag,
                                    token.nesting,
                                );
                                partToken.content = parts[k];
                                partToken.level = token.level;
                                if (insideSpoiler) {
                                    spoilerTokens.push(partToken);
                                } else {
                                    newChildren.push(partToken);
                                }
                            }
                        }
                    } else {
                        if (insideSpoiler) {
                            spoilerTokens.push(token);
                        } else {
                            newChildren.push(token);
                        }
                    }
                }
                if (insideSpoiler && spoilerTokens.length > 0) {
                    const spoilerToken = new Token("spoiler", "", 0);
                    spoilerToken.children = [...spoilerTokens];
                    spoilerToken.content = "";
                    spoilerToken.level = children[0]?.level ?? 0;
                    spoilerToken.markup = "||";
                    newChildren.push(spoilerToken);
                }
                tokens[i].children = newChildren;
            }
        }
    });

    md.renderer.rules.spoiler = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const inner = token.children
            ? self.renderInline(token.children, options, env)
            : md.utils.escapeHtml(token.content);

        return `<spoiler>${inner}</spoiler>`;
    };
};
