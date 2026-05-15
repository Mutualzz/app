import type { CSSObject } from "@emotion/react";
import type {
    Color,
    ColorLike,
    Responsive,
    TypographyColor,
    Variant,
} from "@mutualzz/ui-core";

export interface MarkdownRendererProps {
    value: string;

    color?: Responsive<Color | ColorLike>;
    textColor?: Responsive<TypographyColor | ColorLike | "inherit">;
    variant?: Responsive<Variant>;

    css?: CSSObject;

    enlargeEmojiOnly?: boolean;
}
