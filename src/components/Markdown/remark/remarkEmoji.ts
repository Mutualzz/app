import { getEmoji } from "@utils/emojis";
import shortcodeRegex from "emojibase-regex/shortcode";
import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkEmoji: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, "text", (node, index, parent) => {
            const value = node.value;

            const regex = new RegExp(shortcodeRegex.source, "g");

            let match;
            let lastIndex = 0;
            const nodes = [];

            while ((match = regex.exec(value))) {
                if (match.index > lastIndex) {
                    nodes.push({
                        type: "text",
                        value: value.slice(lastIndex, match.index),
                    });
                }

                const emoji = getEmoji(match[0].slice(1, -1));

                if (emoji) {
                    const emojiObj = {
                        name: emoji.shortcodes?.[0] ?? emoji.emoji,
                        url: `/assets/emojis/${emoji.hexcode.toLowerCase()}.svg`,
                        unicode: emoji.emoji,
                    };

                    nodes.push({
                        type: "emoji",
                        value: emoji.emoji,
                        ...emojiObj,
                        data: {
                            hName: "emoji",
                            hProperties: emojiObj,
                        },
                    });
                } else {
                    nodes.push({
                        type: "text",
                        value: match[0],
                    });
                }

                lastIndex = regex.lastIndex;
            }

            if (lastIndex < value.length) {
                nodes.push({
                    type: "text",
                    value: value.slice(lastIndex),
                });
            }

            const shouldReplace =
                nodes.length > 1 ||
                (nodes.length === 1 &&
                    (nodes[0].type !== "text" || nodes[0].value !== value));

            if (shouldReplace && Array.isArray(parent.children)) {
                parent.children.splice(index, 1, ...nodes);
                return index! + nodes.length - 1;
            }
        });
    };
};
