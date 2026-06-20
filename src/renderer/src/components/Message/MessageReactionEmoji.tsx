import type { APIMessageReactionEmoji } from "@mutualzz/types";
import { useAppStore } from "@hooks/useStores";
import { styled } from "@mutualzz/ui-core";
import {
  emojiValueToUnified,
  getSpriteCoordsForEmojiValue,
  getSpriteStyle
} from "@utils/emojis/emojiSprite";
import { TWEMOJI_URL } from "@utils/urls";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

interface Props {
  emoji: APIMessageReactionEmoji;
  size?: number;
}

const EmojiImage = styled("img")<{ size: number }>(({ size }) => ({
  width: size,
  height: size,
  objectFit: "contain",
  flexShrink: 0
}));

export const MessageReactionEmoji = observer(({ emoji, size = 18 }: Props) => {
  const app = useAppStore();

  useEffect(() => {
    if (emoji.type === "expression" && !app.expressions.get(emoji.expression.id)) {
      void app.expressions.resolve(emoji.expression.id);
    }
  }, [app.expressions, emoji]);

  if (emoji.type === "expression") {
    const expression = app.expressions.get(emoji.expression.id);
    if (!expression?.url) return null;

    return (
      <EmojiImage
        src={expression.url}
        alt={emoji.expression.name}
        size={size}
        draggable={false}
      />
    );
  }

  const spriteCoords = getSpriteCoordsForEmojiValue(emoji.value);
  if (spriteCoords) {
    return (
      <span
        style={getSpriteStyle(spriteCoords.sheetX, spriteCoords.sheetY, size)}
        aria-label={emoji.value}
        role="img"
      />
    );
  }

  return (
    <EmojiImage
      src={`${TWEMOJI_URL}/${emojiValueToUnified(emoji.value).toLowerCase()}.svg`}
      alt={emoji.value}
      size={size}
      draggable={false}
    />
  );
});
