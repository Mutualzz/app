import { Portal, Stack } from "@mutualzz/ui-web";
import { EmojiPicker } from "./EmojiPicker";
import type { Expression } from "@stores/objects/Expression";
import { ReactEditor, useSlate } from "slate-react";
import { useEmojiPicker } from "@hooks/useEmojiPicker";
import { PickerEmoji } from "@utils/emojis/emojiPickerData";
import { SkinTone } from "@utils/emojis/emojiSprite";
import { getEmoji, insertCustomEmoji, insertEmoji } from "@utils/emojis/emojis";
import { GifIcon, SmileyIcon } from "@phosphor-icons/react";
import { useMarkdownInputContext } from "@components/Markdown/MarkdownInput/MarkdownInput.context";
import { IconButton } from "@components/IconButton";

interface Props {
  emojiPicker?: boolean;
  gifPicker?: boolean;
}

export const ExpressionPickerTrigger = ({ emojiPicker, gifPicker }: Props) => {
  const editor = useSlate();
  const { onSendMessage } = useMarkdownInputContext();
  const {
    isOpen,
    toggle,
    openToTab,
    activeTab,
    setActiveTab,
    position,
    triggerRef,
    pickerRef
  } = useEmojiPicker();

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

  const handleSelectGif = (gif: {
    id: string;
    title: string;
    url: string;
    preview: string;
    width: number;
    height: number;
  }) => {
    ReactEditor.focus(editor);
    editor.insertText(`https://giphy.com/gifs/${gif.id} `);
    toggle();
    setTimeout(() => onSendMessage?.(), 0);
  };

  return (
    <Stack spacing={0.75}>
      {gifPicker && (
        <IconButton
          variant="plain"
          onClick={() => openToTab("gifs")}
          title="GIF picker"
          aria-label="Open GIF picker"
        >
          <GifIcon weight="fill" size={24} />
        </IconButton>
      )}

      {emojiPicker && (
        <IconButton
          ref={triggerRef as any}
          variant="plain"
          onClick={() => openToTab("emoji")}
          title="Emoji picker"
          aria-label="Open emoji picker"
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
