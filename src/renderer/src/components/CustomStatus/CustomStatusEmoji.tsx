import { useAppStore } from "@hooks/useStores";
import { styled } from "@mutualzz/ui-core";
import type { PresenceActivityEmoji } from "@mutualzz/types";
import { getEmoji } from "@utils/emojis/emojis";
import { TWEMOJI_URL } from "@utils/urls";
import { observer } from "mobx-react-lite";

interface Props {
  emoji: PresenceActivityEmoji;
  size?: number;
}

const EmojiImage = styled("img")<{ size: number }>(({ size }) => ({
  width: size,
  height: size,
  objectFit: "contain",
  flexShrink: 0
}));

export const CustomStatusEmoji = observer(({ emoji, size = 22 }: Props) => {
  const app = useAppStore();

  if (emoji.id) {
    const expression = app.expressions.get(emoji.id);
    if (!expression?.url) return null;

    return (
      <EmojiImage
        src={expression.url}
        alt={emoji.name}
        size={size}
        draggable={false}
      />
    );
  }

  const standard = getEmoji(emoji.name);
  if (standard?.hexcode) {
    return (
      <EmojiImage
        src={`${TWEMOJI_URL}/${standard.hexcode.toLowerCase()}.svg`}
        alt={emoji.name}
        size={size}
        draggable={false}
      />
    );
  }

  return (
    <span style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>
      {emoji.name}
    </span>
  );
});
