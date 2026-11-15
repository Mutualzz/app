import { type TypographyHeadingKey } from "@mutualzz/ui-core";
import { Typography, useTheme } from "@mutualzz/ui-web";
import {
  ReactEditor,
  type RenderElementProps,
  useSlateStatic
} from "slate-react";
import { formatColor } from "@mutualzz/ui-core";
import { getInputCodeBlocks } from "./codeBlockDecorations";
import { UserMention } from "@components/Markdown/components/mention/UserMention";
import { Emoji } from "@components/Markdown/components/emoji/Emoji";
import { CustomEmoji } from "@components/Markdown/components/emoji/CustomEmoji";
import { RoleMention } from "@components/Markdown/components/mention/RoleMention";
import { type MentionType } from "@mutualzz/types";
import { DefaultMention } from "@components/Markdown/components/mention/DefaultMention";

export const Element = ({
  attributes,
  children,
  element
}: RenderElementProps) => {
  const { theme } = useTheme();
  const editor = useSlateStatic();
  const codeBorder = formatColor(theme.colors.neutral, {
    alpha: 35,
    format: "hexa"
  });
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
      // inside the block — no separate label needed.
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

    case "heading": {
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
    }

    case "emoji":
      return (
        <Emoji
          data-slate-void
          data-slate-inline
          attributes={attributes}
          url={element.url}
          unicode={element.unicode}
          name={element.name}
        >
          {children}
        </Emoji>
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
        >
          {children}
        </CustomEmoji>
      );

    case "mention": {
      const mentionType = element.mentionType as MentionType;
      const mentionId = element.id;

      switch (mentionType) {
        case "user":
          return (
            <UserMention userId={mentionId} attributes={attributes}>
              {children}
            </UserMention>
          );
        case "role":
          return (
            <RoleMention roleId={mentionId} attributes={attributes}>
              {children}
            </RoleMention>
          );
        case "here":
        case "everyone":
          return (
            <DefaultMention mentionId={mentionId} attributes={attributes}>
              {children}
            </DefaultMention>
          );
        default:
          return <span {...attributes}>{children}</span>;
      }
    }
    case "line":
    default: {
      const lineIndex = ReactEditor.findPath(editor, element)[0];
      const codeLineKind =
        lineIndex !== undefined
          ? getInputCodeBlocks(editor.children).lineKinds.get(lineIndex)
          : undefined;

      if (!codeLineKind) return <div {...attributes}>{children}</div>;

      return (
        <div
          {...attributes}
          css={{
            fontFamily: "monospace",
            fontSize: "0.92em",
            padding: "0 0.6em",
            background: formatColor(theme.colors.surface, {
              darken: theme.type === "dark" ? 8 : 0,
              format: "hexa"
            }),
            borderLeft: `1px solid ${codeBorder}`,
            borderRight: `1px solid ${codeBorder}`,
            ...(codeLineKind === "fenceOpen" && {
              borderTop: `1px solid ${codeBorder}`,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              paddingTop: "0.2em"
            }),
            ...(codeLineKind === "fenceClose" && {
              borderBottom: `1px solid ${codeBorder}`,
              borderBottomLeftRadius: 6,
              borderBottomRightRadius: 6,
              paddingBottom: "0.2em"
            })
          }}
        >
          {children}
        </div>
      );
    }
  }
};
