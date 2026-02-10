import type { CSSObject, Theme } from "@emotion/react";
import {
    createColor,
    formatColor,
    isValidColorInput,
    resolveColor,
    resolveTypographyColor,
    type Color,
    type ColorLike,
    type TypographyColor,
} from "@mutualzz/ui-core";
import { Node, Text, type Range } from "slate";

const tokenDefs = [
    { symbol: "**", type: "bold" },
    { symbol: "*", type: "italic" },
    { symbol: "__", type: "underline" },
    { symbol: "~~", type: "strikethrough" },
    { symbol: "`", type: "code" },
    { symbol: "||", type: "spoiler" },
    { symbol: "_", type: "italic" },
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
        spoiler: [],
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
                    ranges.push({
                        isMarker: true,
                        anchor: { path, offset: startOffset },
                        focus: { path, offset: startOffset + markerLength },
                    });

                    ranges.push({
                        [type]: true,
                        anchor: { path, offset: contentStart },
                        focus: { path, offset: contentEnd },
                    });

                    ranges.push({
                        isMarker: true,
                        anchor: { path, offset: contentEnd },
                        focus: { path, offset: contentEnd + markerLength },
                    });
                }
            } else stack.push({ offset: i, symbol });

            i += symbol.length;
        } else i++;
    }

    return ranges;
};

type DecoratedRange = Range & { spoiler?: boolean; isMarker?: boolean };

export const parseSpoilerRanges = ([node, path]: [
    Node,
    number[],
]): DecoratedRange[] => {
    if (!("children" in node)) return [];

    const children = node.children as Node[];
    const ranges: DecoratedRange[] = [];

    type Pos = { childIndex: number; offset: number };

    const findNextToken = (from: Pos): Pos | null => {
        for (
            let childIndex = from.childIndex;
            childIndex < children.length;
            childIndex++
        ) {
            const child = children[childIndex];
            if (!Text.isText(child)) continue;

            const startOffset =
                childIndex === from.childIndex ? from.offset : 0;
            const at = child.text.indexOf("||", startOffset);
            if (at !== -1) return { childIndex: childIndex, offset: at };
        }

        return null;
    };

    let cursor: Pos = { childIndex: 0, offset: 0 };

    while (true) {
        const open = findNextToken(cursor);
        if (!open) break;

        const afterOpen: Pos = {
            childIndex: open.childIndex,
            offset: open.offset + 2,
        };
        const close = findNextToken(afterOpen);
        if (!close) break;

        ranges.push({
            isMarker: true,
            anchor: { path: [...path, open.childIndex], offset: open.offset },
            focus: {
                path: [...path, open.childIndex],
                offset: open.offset + 2,
            },
        });

        const contentAnchor = {
            path: [...path, open.childIndex],
            offset: open.offset + 2,
        };
        const contentFocus = {
            path: [...path, close.childIndex],
            offset: close.offset,
        };

        if (
            contentAnchor.path.join(",") !== contentFocus.path.join(",") ||
            contentAnchor.offset !== contentFocus.offset
        ) {
            ranges.push({
                spoiler: true,
                anchor: contentAnchor,
                focus: contentFocus,
            });
        }

        ranges.push({
            isMarker: true,
            anchor: { path: [...path, close.childIndex], offset: close.offset },
            focus: {
                path: [...path, close.childIndex],
                offset: close.offset + 2,
            },
        });

        cursor = { childIndex: close.childIndex, offset: close.offset + 2 };
    }

    return ranges;
};

export const resolveMarkdownStyles = (
    theme: Theme,
    color: Color | ColorLike,
    textColor: TypographyColor | ColorLike | "inherit",
): Record<string, CSSObject> => {
    const { colors } = theme;
    const resolvedColor = resolveColor(color, theme);

    const parsedTextColor = resolveTypographyColor(textColor, theme);

    const isColorLike = isValidColorInput(parsedTextColor);

    const isDark = createColor(resolvedColor).isDark();
    const solidTextColor = isDark
        ? theme.typography.colors.primary
        : formatColor(resolvedColor, {
              darken: 70,
          });

    const textColorFinal = isColorLike
        ? parsedTextColor
        : theme.typography.colors.primary;

    return {
        outlined: {
            background: colors.background,
            border: `1px solid ${formatColor(resolvedColor, { alpha: 30, format: "hexa" })}`,
            color: textColorFinal,
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${resolvedColor}`,
            },
        },
        solid: {
            background: resolvedColor,
            color: solidTextColor,
            border: "none",
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${resolvedColor}`,
            },
        },
        plain: {
            background: "transparent",
            color: textColorFinal,
            border: "none",
            borderRadius: 8,
            ":focus": {
                outline: "none",
            },
        },
        soft: {
            backgroundColor: formatColor(resolvedColor, {
                format: "hexa",
                darken: 50,
            }),
            color: textColorFinal,
            border: "none",
            borderRadius: 8,
            ":focus": {
                outline: `2px solid ${resolvedColor}`,
            },
        },
    };
};
