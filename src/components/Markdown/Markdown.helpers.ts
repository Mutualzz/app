import type { CSSObject, Theme } from "@emotion/react";
import { formatHex8, parse } from "culori";
import {
    Editor,
    Element,
    Point,
    Range,
    Text,
    Transforms,
    type Descendant,
    type Node,
    type TextUnit,
} from "slate";
import type { EmojiElement } from "../../types/slate";
import type { Color, ColorLike } from "../../ui/src/types";
import { darken, lighten } from "../../ui/src/utils";
import { resolveColor } from "../../ui/src/utils/resolveColor";
import type { getEmojiWithShortcode } from "../../utils/emojis";

const SHORTCUTS: Record<string, Element["type"]> = {
    ">": "blockquote",
};

const tokenDefs = [
    { symbol: "**", type: "bold" },
    { symbol: "*", type: "italic" },
    { symbol: "~~", type: "strikethrough" },
    { symbol: "__", type: "underline" },
    { symbol: "`", type: "code" },
] as const;

type TokenType = (typeof tokenDefs)[number]["type"];

export const parseMarkdownToRanges = (
    text: string,
    path: number[],
): Range[] => {
    const ranges: Range[] = [];
    const stacks: Record<TokenType, { offset: number; symbol: string }[]> = {
        bold: [],
        italic: [],
        strikethrough: [],
        underline: [],
        code: [],
    };

    let i = 0;
    while (i < text.length) {
        const match = tokenDefs.find(({ symbol }) =>
            text.startsWith(symbol, i),
        );
        if (match) {
            const { symbol, type } = match;
            const stack = stacks[type];

            if (stack.length > 0) {
                const { offset: startOffset } = stack.pop()!;
                const markerLength = symbol.length;
                const contentStart = startOffset + markerLength;
                const contentEnd = i;

                if (contentEnd > contentStart) {
                    // Add range for opening marker
                    ranges.push({
                        isMarker: true,
                        anchor: { path, offset: startOffset },
                        focus: { path, offset: startOffset + markerLength },
                    });

                    // Add decorated content range
                    ranges.push({
                        [type]: true,
                        anchor: { path, offset: contentStart },
                        focus: { path, offset: contentEnd },
                    });

                    // Add range for closing marker
                    ranges.push({
                        isMarker: true,
                        anchor: { path, offset: contentEnd },
                        focus: { path, offset: contentEnd + markerLength },
                    });
                }
            } else {
                stack.push({ offset: i, symbol });
            }

            i += symbol.length;
        } else {
            i++;
        }
    }

    return ranges;
};

export const resolveMarkdownStyles = (
    theme: Theme,
    color: Color | ColorLike,
): Record<string, CSSObject> => {
    const parsedColor = parse(resolveColor(color, theme));
    if (!parsedColor) throw new Error("Invalid color");

    return {
        outlined: {
            background: "transparent",
            color: formatHex8(lighten(parsedColor, 0.5)),
            border: `1px solid ${formatHex8(parsedColor)}`,
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${formatHex8(parsedColor)}`,
            },
        },
        solid: {
            background: formatHex8(parsedColor),
            color: formatHex8(lighten(parsedColor, 0.75)),
            border: "none",
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${formatHex8(parsedColor)}`,
            },
        },
        plain: {
            background: "transparent",
            color: formatHex8(lighten(parsedColor, 0.25)),
            border: "none",
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${formatHex8(parsedColor)}`,
            },
        },
        soft: {
            background: formatHex8(darken(parsedColor, 0.5)),
            color: formatHex8(lighten(parsedColor, 0.5)),
            border: "none",
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${formatHex8(parsedColor)}`,
            },
        },
    };
};

export const withShortcuts = (editor: Editor) => {
    const { deleteBackward, insertText } = editor;

    editor.insertText = (text: string) => {
        const { selection } = editor;

        if (text.endsWith(" ") && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection;
            const block = editor.above({
                match: (n) => Element.isElement(n) && editor.isBlock(n),
            });

            const path = block ? block[1] : [];
            const start = editor.start(path);
            const range: Range = {
                anchor,
                focus: start,
            };
            const beforeText = editor.string(range) + text.slice(0, -1);
            const type = SHORTCUTS[beforeText] as Element["type"] | undefined;

            if (type) {
                editor.select(range);

                if (!Range.isCollapsed(range)) {
                    Transforms.delete(editor);
                }

                const newProperties: Partial<Element> = {
                    type,
                };

                editor.setNodes(newProperties, {
                    match: (n) => Element.isElement(n) && editor.isBlock(n),
                });

                return;
            }
        }

        insertText(text);
    };

    editor.deleteBackward = (unit: TextUnit) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const match = editor.above({
                match: (n) => Element.isElement(n) && editor.isBlock(n),
            });

            if (match) {
                const [block, path] = match;
                const start = editor.start(path);

                if (
                    !Editor.isEditor(block) &&
                    Element.isElement(block) &&
                    block.type !== "paragraph" &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newProperties: Partial<Element> = {
                        type: "paragraph",
                    };
                    Transforms.setNodes(editor, newProperties);

                    return;
                }
            }
        }

        deleteBackward(unit);
    };

    return editor;
};

export const withEmojis = (editor: Editor) => {
    const { isInline, isVoid, markableVoid } = editor;

    editor.isInline = (element: Element) => {
        return element.type === "emoji" ? true : isInline(element);
    };

    editor.isVoid = (element: Element) => {
        return element.type === "emoji" ? true : isVoid(element);
    };

    editor.markableVoid = (element: Element) => {
        return element.type === "emoji" || markableVoid(element);
    };

    editor.isSelectable = (element: Element) => {
        return element.type !== "emoji";
    };

    editor.setFragmentData = (data: DataTransfer) => {
        const { selection } = editor;

        if (!selection) return;

        const fragment = editor.fragment(selection);
        const markdown = fragment.map(deseralizeNode).join("");

        data.setData("text/plain", markdown);
    };

    return editor;
};

export const deseralizeNode = (node: Node): string => {
    if (Text.isText(node)) return node.text;

    if (Element.isElement(node)) {
        const children = node.children.map((n) => deseralizeNode(n)).join("");

        switch (node.type) {
            case "paragraph":
                return `${children}`;
            case "blockquote":
                return `> ${children}\n`;
            case "emoji":
                return `:${node.shortcode ?? `${node.id}`}:`;
            case "heading": {
                const hashtag = "#".repeat(node.level);
                return `${hashtag} ${children}\n`;
            }
            default:
                return children;
        }
    }

    return "";
};

export const serializeNode = (line: string): Descendant => {
    if (line.startsWith("> "))
        return {
            type: "blockquote",
            children: [{ text: line.slice(2) }],
        };

    if (line.startsWith("#")) {
        const level = RegExp(/^#+/).exec(line)?.[0].length ?? 1;
        return {
            type: "heading",
            level: Math.min(level, 3) as 1 | 2 | 3,
            children: [{ text: line.slice(level + 1) }],
        };
    }

    return {
        type: "paragraph",
        children: [{ text: line }],
    };
};

export const deseralizeFromMarkdown = (nodes: Node[]): string =>
    nodes.map(deseralizeNode).join("");

export const serializeToMarkdown = (text: string): Descendant[] =>
    text.split("\n").map((line) => serializeNode(line));

export const insertEmoji = (
    editor: Editor,
    shortcode: string,
    emoji: ReturnType<typeof getEmojiWithShortcode>,
) => {
    if (!emoji) return;
    const emojiElement: EmojiElement = {
        type: "emoji",
        id:
            "id" in emoji
                ? (emoji as any).id.toLowerCase()
                : emoji.hexcode.toLowerCase(),
        name: emoji.emoji,
        url: `https://cdnjs.cloudflare.com/ajax/libs/twemoji/16.0.1/svg/${emoji.hexcode.toLowerCase()}.svg`,
        children: [{ text: "" }],
        unicode: emoji.hexcode,
        shortcode: shortcode.toLowerCase(),
    };

    const { selection } = editor;

    if (selection) {
        Transforms.insertNodes(editor, emojiElement);
        const pointAfterEmoji = editor.after(selection.focus);
        if (pointAfterEmoji) Transforms.select(editor, pointAfterEmoji);
    }
};
