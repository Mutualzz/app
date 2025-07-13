import type { Descendant, Text } from "slate";

export function slateToMarkdown(value: Descendant[]): string {
    return value.map(serializeNode).join("\n");
}

function serializeNode(node: Descendant): string {
    if ("text" in node) return serializeText(node);

    const element = node;
    const children = element.children.map(serializeNode).join("");

    switch (element.type) {
        case "heading":
            return `${children}`;
        case "blockquote":
            return children
                .split("\n")
                .map((line) => `> ${line}`)
                .join("\n");
        case "emoji":
            return `:${element.name.toLowerCase()}:`;
        case "line":
        default:
            return children;
    }
}

function serializeText(textNode: Text): string {
    let text = textNode.text.replace(/\n/g, "  \n");

    if (textNode.code) text = `\`${text}\``;
    if (textNode.bold) text = `**${text}**`;
    if (textNode.italic) text = `*${text}*`;
    if (textNode.underline) text = `__${text}__`;
    if (textNode.strikethrough) text = `~~${text}~~`;
    if (textNode.spoiler) text = `||${text}||`;

    return text;
}
