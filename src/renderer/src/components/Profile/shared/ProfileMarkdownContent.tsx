import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import type { CSSObject } from "@emotion/react";

interface Props {
  value: string;
  lineClamp?: number;
  css?: CSSObject;
}

export const ProfileMarkdownContent = ({ value, lineClamp, css }: Props) => (
  <MarkdownRenderer
    value={value}
    textColor="inherit"
    enlargeEmojiOnly={false}
    css={{
      fontSize: "inherit",
      lineHeight: 1.45,
      wordBreak: "break-word",
      ...(lineClamp
        ? {
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: lineClamp,
            WebkitBoxOrient: "vertical"
          }
        : {}),
      ...css
    }}
  />
);
