import { type TypographyHeadingKey } from "@mutualzz/ui-core";
import { Typography, useTheme } from "@mutualzz/ui-web";
import type { RenderElementProps } from "slate-react";
import { UserMention } from "@components/Markdown/components/mention/UserMention";
import { Emoji } from "@components/Markdown/components/emoji/Emoji";
import { CustomEmoji } from "@components/Markdown/components/emoji/CustomEmoji";
import { RoleMention } from "@components/Markdown/components/mention/RoleMention";
import { MentionType } from "@mutualzz/types";
import { DefaultMention } from "@components/Markdown/components/mention/DefaultMention";

export const Element = ({
  attributes,
  children,
  element
}: RenderElementProps) => {
  const { theme } = useTheme();
  switch (element.type) {
    case "blockquote":
      return (
        <blockquote
          {...attributes}
          css={{
            display: "block",
            margin: 0,
            paddingLeft: "0.5em",
            borderLeft: `4px solid ${theme.typography.colors.muted}`,
            color: theme.typography.colors.primary
          }}
        >
          {children}
        </blockquote>
      );

    case "codeBlock":
      // The fence line (```lang) and closing ``` are kept as editable text
      // inside the block — Discord-style. No separate label needed.
      return (
        <pre
          {...attributes}
          css={{
            margin: "0.25em 0",
            padding: "0.5em 0.75em",
            borderRadius: 4,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.typography.colors.muted}`,
            fontFamily: "monospace",
            fontSize: "0.875em",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            color: theme.typography.colors.primary
          }}
        >
          {children}
        </pre>
      );

    case "heading":
      const level = `h${element.level + 2}` as TypographyHeadingKey;
      return (
        <Typography
          {...attributes}
          display="block"
          level={level}
          fontWeight="bold"
        >
          {children}
        </Typography>
      );

    case "emoji":
      return (
        <Emoji
          data-slate-void
          data-slate-inline
          attributes={attributes}
          url={element.url}
          unicode={element.unicode}
          name={element.name}
        />
      );
    case "customEmoji":
      return (
        <CustomEmoji
          data-slate-void
          data-slate-inline
          attributes={attributes}
          url={element.url}
          name={element.name}
          id={element.id}
          animated={element.animated}
        />
      );

    case "mention":
      const mentionType = element.mentionType as MentionType;
      const mentionId = element.id;

      switch (mentionType) {
        case "user":
          return <UserMention userId={mentionId} attributes={attributes} />;
        case "role":
          return <RoleMention roleId={mentionId} attributes={attributes} />;
        case "here":
        case "everyone":
          return (
            <DefaultMention mentionId={mentionId} attributes={attributes} />
          );
      }
    case "line":
    default:
      return <div {...attributes}>{children}</div>;
  }
};
