import type { Root } from "hast";
import remarkParse from "remark-parse";
import { unified, type Plugin } from "unified";
import { visit } from "unist-util-visit";
import { strikethroughFromMarkdown } from "./fromMarkdown";
import { strikethroughSyntax } from "./strikethrough";

export const remarkStrikethrough: Plugin<[], Root> = function () {
    const data = this.data();

    data.micromarkExtensions ??= [];
    data.fromMarkdownExtensions ??= [];

    data.micromarkExtensions.push(strikethroughSyntax());
    data.fromMarkdownExtensions.push(strikethroughFromMarkdown);

    return (tree) => {
        visit(tree, "strikethrough", (node: any) => {
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
