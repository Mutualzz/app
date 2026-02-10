import type MarkdownIt from "markdown-it";

export const brOnEmpty = (md: MarkdownIt) => {
    md.core.ruler.after("inline", "br-on-empty-lines", (state) => {
        const tokens = state.tokens;

        for (let i = 0; i < tokens.length; i++) {
            const nextOpen = tokens[i];

            if (nextOpen?.type !== "paragraph_open") continue;

            const prevClose = tokens[i - 1];
            const prevInline = tokens[i - 2];
            const prevOpen = tokens[i - 3];

            if (
                !prevClose ||
                !prevInline ||
                !prevOpen ||
                prevClose.type !== "paragraph_close" ||
                prevInline.type !== "inline" ||
                prevOpen.type !== "paragraph_open"
            )
                continue;

            const prevMap = prevOpen.map;
            const nextMap = nextOpen.map;

            if (!prevMap || !nextMap) continue;

            const emptyLines = nextMap[0] - prevMap[1];

            if (emptyLines <= 0) continue;

            const brCount = emptyLines;

            const children = prevInline.children || (prevInline.children = []);

            for (let k = 0; k < brCount; k++) {
                // create a hardbreak token (<br>)
                const br = new state.Token("hardbreak", "br", 0);

                children.push(br);
            }
        }
    });
};
