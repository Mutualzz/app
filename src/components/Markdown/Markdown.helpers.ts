import type { CSSObject, Theme } from "@emotion/react";
import type { Color, ColorLike, TypographyColor } from "@ui/types";
import { darken, lighten } from "@ui/utils";
import { resolveColor, resolveTypographyColor } from "@ui/utils/resolveColor";
import { formatHex8, parse } from "culori";
import { Editor, Element, Point, Range, type TextUnit } from "slate";
import type { EmojiElement } from "../../types/slate";
import type { getEmojiWithShortcode } from "../../utils/emojis";

const tokenDefs = [
    { symbol: "**", type: "bold" },
    { symbol: "*", type: "italic" },
    { symbol: "~~", type: "strikethrough" },
    { symbol: "__", type: "underline" },
    { symbol: "`", type: "code" },
] as const;

type TokenType = (typeof tokenDefs)[number]["type"];
type HeadingLevel = 1 | 2 | 3;

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
    textColor: TypographyColor | "inherit",
): Record<string, CSSObject> => {
    const parsedColor = parse(resolveColor(color, theme));
    if (!parsedColor) throw new Error("Invalid color");

    const parsedTextColor =
        textColor === "inherit"
            ? parsedColor
            : parse(resolveTypographyColor(textColor, theme));
    if (!parsedTextColor) throw new Error("Invalid text color");

    return {
        outlined: {
            background: "transparent",
            color: formatHex8(lighten(parsedTextColor, 0.5)),
            border: `1px solid ${formatHex8(parsedColor)}`,
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${formatHex8(parsedColor)}`,
            },
        },
        solid: {
            background: formatHex8(parsedColor),
            color: formatHex8(lighten(parsedTextColor, 0.75)),
            border: "none",
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${formatHex8(parsedColor)}`,
            },
        },
        plain: {
            background: "transparent",
            color: formatHex8(lighten(parsedTextColor, 0.25)),
            border: "none",
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${formatHex8(parsedColor)}`,
            },
        },
        soft: {
            background: formatHex8(darken(parsedColor, 0.5)),
            color: formatHex8(lighten(parsedTextColor, 0.5)),
            border: "none",
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${formatHex8(parsedColor)}`,
            },
        },
    };
};

export const withShortcuts = (editor: Editor) => {
    const { insertText, deleteBackward, normalizeNode } = editor;

    editor.insertText = (text: string) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const blockEntry = editor.above({
                match: (n) => Element.isElement(n) && editor.isBlock(n),
            });

            if (blockEntry) {
                const [blockNode, blockPath] = blockEntry;

                const range: Range = {
                    anchor: selection.anchor,
                    focus: editor.start(blockPath),
                };

                const beforeText = editor.string(range) + text;

                if (/^>\s/.test(beforeText)) {
                    editor.select(range);
                    if (!Range.isCollapsed(range)) editor.delete();

                    editor.setNodes(
                        { type: "blockquote" },
                        {
                            match: (n) =>
                                Element.isElement(n) && editor.isBlock(n),
                        },
                    );

                    return;
                }

                const headingMatch = /^(#{1,3})(\s|$)/.exec(beforeText);
                const level = headingMatch?.[1].length;

                if (level) {
                    if (
                        Element.isElement(blockNode) &&
                        blockNode.type === "heading"
                    ) {
                        if (blockNode.level !== level) {
                            editor.setNodes(
                                { level: level as HeadingLevel },
                                {
                                    match: (n) =>
                                        Element.isElement(n) &&
                                        n.type === "heading",
                                },
                            );
                        }
                    } else {
                        editor.setNodes(
                            { type: "heading", level: level as HeadingLevel },
                            {
                                match: (n) =>
                                    Element.isElement(n) && editor.isBlock(n),
                            },
                        );
                    }
                }
            }
        }

        insertText(text);
    };

    editor.deleteBackward = (unit: TextUnit) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const match = editor.above({
                match: (n) => Element.isElement(n) && n.type === "blockquote",
            });

            if (match) {
                const [, path] = match;
                const start = editor.start(path);

                if (Point.equals(selection.anchor, start)) {
                    editor.setNodes(
                        {
                            type: "paragraph",
                        },
                        { at: path },
                    );

                    return;
                }
            }
        }

        deleteBackward(unit);
    };

    editor.normalizeNode = ([node, path]) => {
        if (
            Element.isElement(node) &&
            editor.isBlock(node) &&
            node.type === "heading"
        ) {
            const text = Editor.string(editor, path);
            if (!text.startsWith("#")) {
                editor.withoutNormalizing(() => {
                    editor.setNodes({ type: "paragraph" }, { at: path });
                });
                return;
            }
        }

        normalizeNode([node, path]);
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

    return editor;
};

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
        editor.insertNodes(emojiElement);
        const pointAfterEmoji = editor.after(selection.focus);
        if (pointAfterEmoji) editor.select(pointAfterEmoji);
    }
};
