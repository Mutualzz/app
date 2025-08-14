import type { CSSObject } from "@emotion/react";
import type { Color, ColorLike, TypographyColor, Variant } from "@mutualzz/ui";

export interface MarkdownRendererProps {
    value: string;

    color?: Color | ColorLike;
    textColor?: TypographyColor | ColorLike | "inherit";
    variant?: Variant;

    css?: CSSObject;
}
