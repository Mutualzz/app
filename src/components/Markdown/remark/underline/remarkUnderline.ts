import type { Root } from "mdast";
import remarkParse from "remark-parse";
import { unified, type Plugin } from "unified";
import { visit } from "unist-util-visit";
import { underlineFromMarkdown } from "./fromMarkdown";
import { underlineSyntax } from "./underline";

export const remarkUnderline: Plugin<[], Root> = function () {
    const data = this.data();

    data.micromarkExtensions ??= [];
    data.fromMarkdownExtensions ??= [];

    data.micromarkExtensions.push(underlineSyntax());
    data.fromMarkdownExtensions.push(underlineFromMarkdown);

    return (tree) => {
        visit(tree, "underline", (node: any) => {
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
