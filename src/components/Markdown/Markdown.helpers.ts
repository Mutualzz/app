import type { CSSObject, Theme } from "@emotion/react";
import {
    darken,
    lighten,
    resolveColor,
    resolveTypographyColor,
    type Color,
    type ColorLike,
    type TypographyColor,
} from "@mutualzz/ui";
import { formatHex8, parse } from "culori";
import { type Range } from "slate";

const tokenDefs = [
    { symbol: "**", type: "bold" },
    { symbol: "*", type: "italic" },
    { symbol: "_", type: "italic" },
    { symbol: "~~", type: "strikethrough" },
    { symbol: "__", type: "underline" },
    { symbol: "`", type: "code" },
    { symbol: "||", type: "spoiler" },
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
