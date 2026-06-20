import { MessageReactionEmoji } from "@components/Message/MessageReactionEmoji";
import { Stack, Typography } from "@mutualzz/ui-web";
import { formatColor, styled } from "@mutualzz/ui-core";
import { Message } from "@stores/objects/Message";
import { observer } from "mobx-react-lite";

interface Props {
  message: Message;
}

const ReactionPill = styled("button")<{ active?: boolean }>(
  ({ theme, active }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 28,
    padding: "0 8px",
    borderRadius: 8,
    border: `1px solid ${
      active
        ? theme.colors.primary
        : formatColor(theme.colors.neutral, { alpha: 24, format: "hexa" })
    }`,
    background: active
      ? formatColor(theme.colors.primary, { alpha: 18, format: "hexa" })
      : formatColor(theme.colors.surface, { alpha: 80, format: "hexa" }),
    cursor: "pointer",
    transition: "background 120ms ease, border-color 120ms ease",

    "&:hover": {
      background: active
        ? formatColor(theme.colors.primary, { alpha: 28, format: "hexa" })
        : formatColor(theme.colors.neutral, { alpha: 12, format: "hexa" })
    }
  })
);

export const MessageReactions = observer(({ message }: Props) => {
  if (message.editing || message.reactions.length === 0) return null;

  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" mt={0.5}>
      {message.reactions.map((reaction) => (
        <ReactionPill
          key={
            reaction.emoji.type === "unicode"
              ? reaction.emoji.value
              : reaction.emoji.expression.id
          }
          active={reaction.me}
          onClick={() => void message.toggleReaction(reaction.emoji)}
          aria-label={`Toggle reaction, count ${reaction.count}`}
        >
          <MessageReactionEmoji emoji={reaction.emoji} />
          <Typography level="body-xs" textColor={reaction.me ? "primary" : "muted"}>
            {reaction.count}
          </Typography>
        </ReactionPill>
      ))}
    </Stack>
  );
});
