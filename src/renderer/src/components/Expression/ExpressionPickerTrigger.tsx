import { Portal, Stack } from "@mutualzz/ui-web";
import { EmojiPicker } from "./EmojiPicker";
import type { Expression } from "@stores/objects/Expression";
import { ReactEditor, useSlate } from "slate-react";
import { useExpressionPicker } from "@renderer/hooks/useExpressionPicker";
import { PickerEmoji } from "@utils/emojis/emojiPickerData";
import { SkinTone } from "@utils/emojis/emojiSprite";
import { getEmoji, insertCustomEmoji, insertEmoji } from "@utils/emojis/emojis";
import { GifIcon, SmileyIcon, StickerIcon } from "@phosphor-icons/react";
import { useMarkdownInputContext } from "@components/Markdown/MarkdownInput/MarkdownInput.context";
import { IconButton } from "@components/IconButton";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  emojiPicker?: boolean;
  gifPicker?: boolean;
  stickerPicker?: boolean;
}

export const ExpressionPickerTrigger = ({
  emojiPicker,
  gifPicker,
  stickerPicker
}: Props) => {
  const { t } = useTranslation("chat");
  const editor = useSlate();
  const { onSendMessage, onSelectSticker } = useMarkdownInputContext();
  const {
    isOpen,
    toggle,
    openToTab,
    activeTab,
    setActiveTab,
    position,
    triggerRef,
    pickerRef
  } = useExpressionPicker();

  const stickerTriggerRef = useRef<HTMLButtonElement>(null);
  const gifTriggerRef = useRef<HTMLButtonElement>(null);

  const handleSelectEmoji = (pickerEmoji: PickerEmoji, skinTone: SkinTone) => {
    const emoji = getEmoji(pickerEmoji.shortName);
    if (!emoji) return;

    let emojiToInsert = emoji;
    if (skinTone && emoji.skins) {
      const skinModifierMap: Record<string, string> = {
        "1F3FB": "\u{1F3FB}",
        "1F3FC": "\u{1F3FC}",
        "1F3FD": "\u{1F3FD}",
        "1F3FE": "\u{1F3FE}",
        "1F3FF": "\u{1F3FF}"
      };
      const modifier = skinModifierMap[skinTone];
      const skinVariant = emoji.skins?.find((s) => s.emoji.includes(modifier));
      if (skinVariant) emojiToInsert = skinVariant;
    }

    ReactEditor.focus(editor);
    insertEmoji(editor, emojiToInsert, false);
    toggle();
  };

  const handleSelectCustomEmoji = (emoji: Expression) => {
    ReactEditor.focus(editor);
    insertCustomEmoji(editor, emoji, false);
    toggle();
  };

  const handleSelectGif = (gif: { url: string; slug: any }) => {
    toggle();
    const isKlipy = gif.url.includes("klipy.com");
    const sendUrl = isKlipy ? `https://klipy.com/gifs/${gif.slug}` : gif.url;
    setTimeout(() => onSendMessage?.(sendUrl), 0);
  };

  const handleSelectSticker = (sticker: Expression) => {
    onSelectSticker?.(sticker);
    toggle();
  };

  return (
    <Stack spacing={0.75} alignItems="center" css={{ alignSelf: "center" }}>
      {stickerPicker && (
        <IconButton
          ref={stickerTriggerRef as any}
          variant="plain"
          onClick={() => openToTab("stickers", stickerTriggerRef as any)}
          title={t("composer.stickerPicker")}
          aria-label={t("composer.openStickerPicker")}
        >
          <StickerIcon weight="fill" size={24} />
        </IconButton>
      )}
      {gifPicker && (
        <IconButton
          ref={gifTriggerRef as any}
          variant="plain"
          onClick={() => openToTab("gifs", gifTriggerRef as any)}
          title={t("composer.gifPicker")}
          aria-label={t("composer.openGifPicker")}
        >
          <GifIcon weight="fill" size={24} />
        </IconButton>
      )}

      {emojiPicker && (
        <IconButton
          ref={triggerRef as any}
          variant="plain"
          onClick={() => openToTab("emoji")}
          title={t("composer.emojiPicker")}
          aria-label={t("composer.openEmojiPicker")}
          aria-expanded={isOpen}
        >
          <SmileyIcon weight="fill" size={24} />
        </IconButton>
      )}

      {isOpen && (
        <Portal>
          <div
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              zIndex: 1400
            }}
          >
            <EmojiPicker
              pickerRef={pickerRef as any}
              onSelectEmoji={handleSelectEmoji}
              onSelectCustomEmoji={handleSelectCustomEmoji}
              onSelectGif={handleSelectGif}
              onSelectSticker={handleSelectSticker}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </Portal>
      )}
    </Stack>
  );
};
ExpressionPickerTrigger.displayName = "ExpressionPickerTrigger";
