import type { Nodes, Root } from "mdast";
import {
    findAndReplace,
    type Find,
    type Replace,
} from "mdast-util-find-and-replace";
import type { SpoilerNode } from "types/mdast";
import type { Plugin } from "unified";

export const remarkSpoiler: Plugin<[], Root> = () => {
    function replaceSpoiler(match: string): SpoilerNode | false {
        const got = match.slice(2, -2); // Remove the || from the start and end
        if (typeof got === "undefined") return false;

        return {
            type: "spoiler",
            text: got,
            value: got,
            data: {
                hName: "spoiler",
                hProperties: {
                    text: got,
                },
            },
        };
    }

    const replaces: [Find, Replace][] = [
        [new RegExp(/\|\|([\s\S]+?)\|\|/g), replaceSpoiler],
    ];

    function transformer(tree: Nodes) {
        findAndReplace(tree, replaces);
    }

    return transformer;
};
