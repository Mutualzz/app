import type { CSSObject } from "@emotion/react";
import type { ColorLike, Responsive, TypographyColor, TypographyLevel } from "@mutualzz/ui-core";

export interface MarkdownRendererProps {
  value: string;

  textColor?: Responsive<TypographyColor | ColorLike | "inherit">;

  level?: Responsive<TypographyLevel | "inherit">;

  css?: CSSObject;

  enlargeEmojiOnly?: boolean;
}
