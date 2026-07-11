import { EmojiPicker } from "@components/Expression/EmojiPicker";
import { IconButton } from "@components/IconButton";
import { Popover } from "@mutualzz/ui-web";
import type { Expression } from "@stores/objects/Expression";
import type { PresenceActivityEmoji } from "@mutualzz/types";
import { PickerEmoji } from "@utils/emojis/emojiPickerData";
import { SkinTone } from "@utils/emojis/emojiSprite";
import { getEmoji } from "@utils/emojis/emojis";
import { CustomStatusEmoji } from "./CustomStatusEmoji";
import { SmileyIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  value: PresenceActivityEmoji | null;
  onChange: (emoji: PresenceActivityEmoji | null) => void;
}

export const CustomStatusEmojiPicker = ({ value, onChange }: Props) => {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState<"emoji" | "gifs" | "stickers">(
    "emoji"
  );

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
      const skinVariant = emoji.skins?.find((skin) =>
        skin.emoji.includes(modifier)
      );
      if (skinVariant) emojiToInsert = skinVariant;
    }

    onChange({ name: emojiToInsert.emoji });
  };

  const handleSelectCustomEmoji = (emoji: Expression) => {
    onChange({
      id: emoji.id,
      name: emoji.name,
      animated: emoji.animated
    });
  };

  return (
    <Popover
      trigger={
        <IconButton
          variant="plain"
          color={value ? "primary" : "neutral"}
          title={
            value ? t("customStatus.changeEmoji") : t("customStatus.addEmoji")
          }
          aria-label={t("customStatus.chooseEmoji")}
          css={{
            width: "2.25rem",
            height: "2.25rem",
            flexShrink: 0
          }}
        >
          {value ? (
            <CustomStatusEmoji emoji={value} size={20} />
          ) : (
            <SmileyIcon weight="fill" size={20} />
          )}
        </IconButton>
      }
      placement="left"
    >
      <EmojiPicker
        onSelectEmoji={handleSelectEmoji}
        onSelectCustomEmoji={handleSelectCustomEmoji}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        disableGif
        disableStickers
      />
    </Popover>
  );
};
