import type { CSSObject } from "@emotion/react";
import type {
    Color,
    ColorLike,
    Responsive,
    TypographyColor,
    Variant,
} from "@mutualzz/ui-core";

export interface MarkdownInputProps {
    color?: Responsive<Color | ColorLike>;
    textColor?: Responsive<TypographyColor | ColorLike | "inherit">;
    variant?: Responsive<Variant>;

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
