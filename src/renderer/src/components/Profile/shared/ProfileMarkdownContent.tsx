import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { ProfileScrim } from "@components/Profile/shared/ProfileScrim";
import type { CSSObject } from "@emotion/react";

interface Props {
  value: string;
  lineClamp?: number;
  scrim?: boolean;
  css?: CSSObject;
}

export const ProfileMarkdownContent = ({
  value,
  lineClamp,
  scrim = false,
  css
}: Props) => {
  const content = (
    <MarkdownRenderer
      value={value}
      textColor="primary"
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

  if (!scrim) return content;

  return <ProfileScrim>{content}</ProfileScrim>;
};
