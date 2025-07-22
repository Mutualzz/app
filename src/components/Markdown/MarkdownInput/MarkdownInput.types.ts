import type { CSSObject } from "@emotion/react";
import type { Color, ColorLike, TypographyColor, Variant } from "@mutualzz/ui";

export interface MarkdownInputProps {
    color?: Color | ColorLike;
    textColor?: TypographyColor | "inherit";
    variant?: Variant;

    autoFocus?: boolean;
    emoticons?: boolean;
    hoverToolbar?: boolean;

    disabled?: boolean;

    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    onEnter?: () => void;

    css?: CSSObject;
}
