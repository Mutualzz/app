import { getEmoji } from "@utils/emojis";
import shortcodeRegex from "emojibase-regex/shortcode";
import type { Nodes, Root } from "mdast";
import {
    findAndReplace,
    type Find,
    type Replace,
} from "mdast-util-find-and-replace";
import type { EmojiNode } from "types/mdast";
import type { Plugin } from "unified";

export const remarkEmoji: Plugin<[], Root> = () => {
    function replaceEmoji(match: string): EmojiNode | false {
        const got = getEmoji(match.replaceAll(/:/g, ""));
        if (typeof got === "undefined") return false;

        const emojiObj = {
            name: got.shortcodes?.[0] ?? got.emoji,
            url: `/assets/emojis/${got.hexcode.toLowerCase()}.svg`,
            unicode: got.emoji,
        };

        return {
            type: "emoji",
            value: got.emoji,
            ...emojiObj,
            data: {
                hName: "emoji",
                hProperties: emojiObj,
            },
        };
    }

    const replaces: [Find, Replace][] = [
        [new RegExp(shortcodeRegex, "g"), replaceEmoji],
    ];

    function transformer(tree: Nodes) {
        findAndReplace(tree, replaces);
    }

    return transformer;
};
