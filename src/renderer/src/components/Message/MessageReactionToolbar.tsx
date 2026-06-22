import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { useRecentEmojis } from "@renderer/hooks/useRecentEmojis";
import { useAppStore } from "@hooks/useStores";
import { Divider, Stack } from "@mutualzz/ui-web";
import { styled } from "@mutualzz/ui-core";
import { Message } from "@stores/objects/Message";
import { getSpriteStyle } from "@utils/emojis/emojiSprite";
import { pickerEmojiToReactionEmoji } from "@utils/reactions";
import { getQuickReactionItems } from "@utils/quickReactionEmojis";
import { SmileyIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import type { RefObject } from "react";

const EMOJI_SIZE = 20;

const QuickEmojiButton = styled("button")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  padding: 0,
  border: "none",
  borderRadius: 6,
  background: "transparent",
  cursor: "pointer",
  flexShrink: 0,
  transition: "background 120ms ease",

  "&:hover": {
    background: theme.colors.surface
  }
}));

const CustomEmojiImg = styled("img")({
  width: EMOJI_SIZE,
  height: EMOJI_SIZE,
  objectFit: "contain",
  borderRadius: 4
});

const SpriteEmoji = ({
  sheetX,
  sheetY,
  title
}: {
  sheetX: number;
  sheetY: number;
  title: string;
}) => (
  <span
    style={getSpriteStyle(sheetX, sheetY, EMOJI_SIZE)}
    title={title}
    aria-label={title}
  />
);

interface Props {
  message: Message;
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export const MessageReactionToolbar = observer(
  ({ message, pickerOpen, onPickerOpenChange, triggerRef }: Props) => {
    const app = useAppStore();
    const { recents, addRecentStandard, addRecentCustom } = useRecentEmojis();
    const quickItems = getQuickReactionItems(app, recents, 3);

    const react = (emoji: ReturnType<typeof pickerEmojiToReactionEmoji>) => {
      void message.toggleReaction(emoji);
    };

    const handleQuickReaction = (item: (typeof quickItems)[number]) => {
      if (item.kind === "standard") {
        addRecentStandard(item.emoji.unified, item.skinTone);
      } else {
        addRecentCustom(
          item.expression.id,
          item.expression.name,
          item.expression.url,
          item.expression.animated
        );
      }

      react(item.toReaction());
    };

    return (
      <Stack direction="row" alignItems="center" spacing={0.75}>
        {quickItems.map((item) => (
          <Tooltip key={item.key} offset={16} content={`:${item.title}:`}>
            <QuickEmojiButton
              type="button"
              onClick={() => handleQuickReaction(item)}
              aria-label={`React with ${item.title}`}
            >
              {item.kind === "standard" ? (
                <SpriteEmoji
                  sheetX={item.sheetX}
                  sheetY={item.sheetY}
                  title={item.title}
                />
              ) : (
                <CustomEmojiImg
                  src={item.expression.url}
                  alt={item.title}
                  draggable={false}
                />
              )}
            </QuickEmojiButton>
          </Tooltip>
        ))}
        {quickItems.length > 0 && (
          <Divider orientation="vertical" css={{ opacity: 0.5 }} />
        )}

        <Tooltip offset={16} content="Add reaction">
          <IconButton
            ref={triggerRef}
            variant="plain"
            size="sm"
            onClick={() => onPickerOpenChange(!pickerOpen)}
            aria-label="Add reaction"
            aria-expanded={pickerOpen}
          >
            <SmileyIcon weight="fill" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }
);
