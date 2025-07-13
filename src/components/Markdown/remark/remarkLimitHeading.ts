import type { Heading, Paragraph, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkLimitHeading: Plugin<[], Root> = () => (tree) => {
    visit(tree, "heading", (node: Heading, index, parent) => {
        if (node.depth > 3 && parent && typeof index === "number") {
            const hashes = "#".repeat(node.depth) + " ";
            const fallback: Paragraph = {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        value: hashes,
                    },
                    ...node.children,
                ],
            };

            parent.children[index] = fallback;
        }
    });
};
