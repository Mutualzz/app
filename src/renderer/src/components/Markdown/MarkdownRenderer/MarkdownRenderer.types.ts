import type { CSSObject } from "@emotion/react";
import type { ColorLike, Responsive, TypographyColor } from "@mutualzz/ui-core";
import { Snowflake } from "@mutualzz/types";

export interface MarkdownRendererProps {
    value: string;

    textColor?: Responsive<TypographyColor | ColorLike | "inherit">;

    css?: CSSObject;

    enlargeEmojiOnly?: boolean;
    spaceId?: Snowflake | null;
}
