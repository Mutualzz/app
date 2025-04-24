import { css, type Theme } from "@emotion/react";
import { isThemeColor } from "@utils/isThemeColor";
import { isTypographyColor } from "@utils/isTypographyColor";
import { formatHex8, parse } from "culori";
import type { DividerLineColor, DividerTextColor } from "./Divider.types";

export const insetMap = {
    none: css``,
    context: css`
        margin: 0 0.5rem;
    `,
    start: css`
        margin-left: 1rem;
    `,
    end: css`
        margin-right: 1rem;
    `,
};

export const resolveDividerColor = (
    { colors }: Theme,
    color: DividerLineColor,
) => {
    const isCustomColor = !isThemeColor(color);
    const resolvedColor = isCustomColor ? color : colors[color];

    const parsedColor = parse(resolvedColor);
    if (!parsedColor) throw new Error("Invalid color");

    return formatHex8(parsedColor);
};

export const resolveDividerTextColor = (
    { colors }: Theme,
    color: DividerTextColor,
) => {
    const isCustomColor = !isTypographyColor(color);
    const resolvedColor = isCustomColor ? color : colors.typography[color];

    const parsedColor = parse(resolvedColor);
    if (!parsedColor) throw new Error("Invalid color");

    return formatHex8(parsedColor);
};
