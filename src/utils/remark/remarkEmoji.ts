import type { Root, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

import type { EmojiNode } from "../../types/mdast";
import { getEmojiWithShortcode } from "../emojis";

export const remarkEmoji: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, "text", (node: Text, index, parent) => {
            const value = node.value;
            const regex = /:(\w+):/g;
            let match;
            let lastIndex = 0;
            const children: (Text | EmojiNode)[] = [];

            while ((match = regex.exec(value)) !== null) {
                const [full] = match;
                const start = match.index;
                const end = start + full.length;

                const shortcode = match[1].toLowerCase();

                if (start > lastIndex) {
                    children.push({
                        type: "text",
                        value: value.slice(lastIndex, start),
                    });
                }

                const emoji = getEmojiWithShortcode(shortcode);
                if (emoji) {
                    children.push({
                        type: "emoji",
                        id: shortcode,
                        shortcode,
                        url: `https://cdnjs.cloudflare.com/ajax/libs/twemoji/16.0.1/svg/${emoji.hexcode.toLowerCase()}.svg`,
                        value: emoji.emoji,
                        data: {
                            hName: "emoji",
                            hProperties: {
                                id: shortcode,
                                shortcode,
                                url: `https://cdnjs.cloudflare.com/ajax/libs/twemoji/16.0.1/svg/${emoji.hexcode.toLowerCase()}.svg`,
                                unicode: emoji.hexcode,
                                value: emoji.emoji,
                            },
                        },
                    });
                } else {
                    children.push({ type: "text", value: full });
                }

                lastIndex = end;
            }

            if (lastIndex < value.length) {
                children.push({ type: "text", value: value.slice(lastIndex) });
            }

            if (parent && index != null) {
                parent.children.splice(index, 1, ...(children as any));
            }
        });
    };
};
