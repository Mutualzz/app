import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import type { PresenceActivity, PresenceActivityEmoji } from "@mutualzz/types";
import { hasStatusEmoji } from "@utils/customStatus";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { CustomStatusEmoji } from "./CustomStatusEmoji";
import { TypographyColor, TypographyLevel } from "@mutualzz/ui-core";

interface Props {
  activity?: PresenceActivity | null;
  text?: string | null;
  emoji?: PresenceActivityEmoji | null;
  fontSize?: number;
  level?: TypographyLevel;
  textColor?: TypographyColor;
  ellipsis?: boolean;
  emojiSize?: number;
}

function canRenderStatusEmoji(
  emoji: PresenceActivityEmoji | null,
  getExpression: (id: string) => { url: string } | undefined
) {
  if (!emoji || !hasStatusEmoji(emoji)) return false;

  if (emoji.id) {
    return Boolean(getExpression(emoji.id)?.url);
  }

  return Boolean(emoji.name?.trim());
}

export const CustomStatusDisplay = observer(
  ({
    activity,
    text,
    emoji,
    fontSize = 12,
    level,
    textColor = "accent",
    ellipsis,
    emojiSize = 20
  }: Props) => {
    const app = useAppStore();
    const statusText = (text ?? activity?.state ?? activity?.name ?? "").trim();
    const statusEmoji = emoji ?? activity?.emoji ?? null;

    useEffect(() => {
      if (statusEmoji?.id && !app.expressions.get(statusEmoji.id)) {
        void app.expressions.resolve(statusEmoji.id);
      }
    }, [app.expressions, statusEmoji?.id]);

    const showEmoji = canRenderStatusEmoji(statusEmoji, (id) =>
      app.expressions.get(id)
    );

    if (!statusText && !showEmoji) return null;

    const markdown = statusText ? (
      <Typography
        {...(level ? { level } : { fontSize })}
        textColor={textColor}
        css={{
          minWidth: 0,
          overflow: ellipsis ? "hidden" : undefined,
          textOverflow: ellipsis ? "ellipsis" : undefined,
          whiteSpace: ellipsis ? "nowrap" : undefined,
          "& > div": {
            display: "contents"
          },
          "& *": {
            margin: 0,
            display: "inline"
          }
        }}
      >
        <MarkdownRenderer
          value={statusText}
          textColor={textColor === "muted" ? "inherit" : textColor}
          enlargeEmojiOnly={false}
        />
      </Typography>
    ) : null;

    if (!showEmoji || !statusEmoji) return markdown;

    return (
      <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
        <CustomStatusEmoji emoji={statusEmoji} size={emojiSize} />
        {markdown}
      </Stack>
    );
  }
);
