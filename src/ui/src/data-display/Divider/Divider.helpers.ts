import type { Theme } from "@mutualzz/ui/types";
import { isThemeColor } from "@mutualzz/ui/utils/isThemeColor";
import { isTypographyColor } from "@mutualzz/ui/utils/isTypographyColor";
import { formatHex8, parse } from "culori";
import type {
    DividerLineColor,
    DividerTextColor,
    DividerVariant,
} from "./Divider.types";

export const resolveDividerLineColor = (
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

export const resolveDividerVariant = (
    isVertical: boolean,
    lineColor: string,
    variant: DividerVariant,
) => {
    switch (variant) {
        case "dashed":
            return isVertical
                ? `width: 1px; background-image: repeating-linear-gradient(to bottom,${lineColor},${lineColor} 4px,transparent 4px,transparent 8px);`
                : `height: 1px; background-image: repeating-linear-gradient(to right,${lineColor},${lineColor} 4px,transparent 4px,transparent 8px);`;
        case "dotted":
            return isVertical
                ? `width: 1px; background-image: repeating-linear-gradient(to bottom,${lineColor},${lineColor} 1px,transparent 1px,transparent 4px);`
                : `height: 1px; background-image: repeating-linear-gradient(to right,${lineColor},${lineColor} 1px,transparent 1px,transparent 4px);`;
        case "double":
            return isVertical
                ? `width: 1px; border-left: 3px double ${lineColor}; background: none; box-sizing: content-box;`
                : `height: 0; border-top: 3px double ${lineColor}; background: none; box-sizing: content-box;`;
        case "solid":
        default:
            return isVertical
                ? `width: 1px; background-color: ${lineColor};`
                : `height: 1px; background-color: ${lineColor};`;
    }
};
