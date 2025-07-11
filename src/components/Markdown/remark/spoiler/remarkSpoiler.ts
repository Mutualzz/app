import type { Root } from "hast";
import remarkParse from "remark-parse";
import { unified, type Plugin } from "unified";
import { visit } from "unist-util-visit";
import { spoilerFromMarkdown } from "./fromMarkdown";
import { spoilerSyntax } from "./spoiler";

export const remarkSpoiler: Plugin<[], Root> = function () {
    const data = this.data();

    data.micromarkExtensions ??= [];
    data.fromMarkdownExtensions ??= [];

    data.micromarkExtensions.push(spoilerSyntax());
    data.fromMarkdownExtensions.push(spoilerFromMarkdown);

    return (tree) => {
        visit(tree, "spoiler", (node: any) => {
            if (
                node.children &&
                node.children.length === 1 &&
                node.children[0].type === "text"
            ) {
                const parsed = unified()
                    .use(remarkParse)
                    .parse(node.children[0].value);

                node.children = parsed.children;
            }
        });
    };
};
