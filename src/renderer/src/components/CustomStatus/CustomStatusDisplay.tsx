import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { Stack, Typography } from "@mutualzz/ui-web";
import type { PresenceActivity, PresenceActivityEmoji } from "@mutualzz/types";
import { hasStatusEmoji } from "@utils/customStatus";
import { CustomStatusEmoji } from "./CustomStatusEmoji";

interface Props {
  activity?: PresenceActivity | null;
  text?: string | null;
  emoji?: PresenceActivityEmoji | null;
  fontSize?: number;
  level?: "body-sm" | "body-md";
  textColor?: "primary" | "accent" | "inherit" | "muted";
  ellipsis?: boolean;
  emojiSize?: number;
}

export const CustomStatusDisplay = ({
  activity,
  text,
  emoji,
  fontSize = 12,
  level,
  textColor = "accent",
  ellipsis,
  emojiSize = 20
}: Props) => {
  const statusText = (text ?? activity?.state ?? activity?.name ?? "").trim();
  const statusEmoji = emoji ?? activity?.emoji ?? null;

  if (!statusText && !hasStatusEmoji(statusEmoji)) return null;

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
          display: "inline",
          height: "auto",
          overflow: "visible"
        }
      }}
    >
      <MarkdownRenderer
        value={statusText}
        textColor={textColor === "muted" ? "inherit" : textColor}
        enlargeEmojiOnly={false}
        css={{ display: "inline", height: "auto", overflowY: "visible" }}
      />
    </Typography>
  ) : null;

  if (!hasStatusEmoji(statusEmoji) || !statusEmoji) return markdown;

  return (
    <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
      <CustomStatusEmoji emoji={statusEmoji} size={emojiSize} />
      {markdown}
    </Stack>
  );
};
