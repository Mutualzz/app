import type { CSSObject } from "@emotion/react";
import type { Color, ColorLike, TypographyColor, Variant } from "@ui/index";

export interface MarkdownProps {
    color?: Color | ColorLike;
    textColor?: TypographyColor | "inherit";
    variant?: Variant;

    disabled?: boolean;

    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    onEnter?: () => void;

    css?: CSSObject;
}
