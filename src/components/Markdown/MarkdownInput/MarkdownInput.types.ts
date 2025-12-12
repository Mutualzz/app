import type { CSSObject } from "@emotion/react";
import type {
    Color,
    ColorLike,
    Responsive,
    TypographyColor,
    Variant,
} from "@mutualzz/ui-core";
import type { KeyboardEvent } from "react";
import type { Editor } from "slate";

export interface MarkdownInputProps {
    color?: Responsive<Color | ColorLike>;
    textColor?: Responsive<TypographyColor | ColorLike | "inherit">;
    variant?: Responsive<Variant>;

    autoFocus?: boolean;
    emoticons?: boolean;
    hoverToolbar?: boolean;

    disabled?: boolean;

    value?: string;
    onChange?: (value: string, editor: Editor) => void;
    onKeyDown?: (event: KeyboardEvent, editor: Editor) => void;
    placeholder?: string;

    css?: CSSObject;
}
