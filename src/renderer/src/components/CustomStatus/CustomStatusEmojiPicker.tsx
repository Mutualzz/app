import { EmojiPicker } from "@components/Expression/EmojiPicker";
import { IconButton } from "@components/IconButton";
import { Portal } from "@mutualzz/ui-web";
import type { Expression } from "@stores/objects/Expression";
import type { PresenceActivityEmoji } from "@mutualzz/types";
import { PickerEmoji } from "@utils/emojis/emojiPickerData";
import { SkinTone } from "@utils/emojis/emojiSprite";
import { getEmoji } from "@utils/emojis/emojis";
import { CustomStatusEmoji } from "./CustomStatusEmoji";
import { SmileyIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: PresenceActivityEmoji | null;
  onChange: (emoji: PresenceActivityEmoji | null) => void;
}

export const CustomStatusEmojiPicker = ({ value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"emoji" | "gifs" | "stickers">(
    "emoji"
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const pickerWidth = 360;
    const left = Math.min(
      rect.left,
      Math.max(12, window.innerWidth - pickerWidth - 12)
    );

    setPosition({
      top: Math.max(12, rect.top - 420),
      left
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (pickerRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

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
    setIsOpen(false);
  };

  const handleSelectCustomEmoji = (emoji: Expression) => {
    onChange({
      id: emoji.id,
      name: emoji.name,
      animated: emoji.animated
    });
    setIsOpen(false);
  };

  return (
    <>
      <IconButton
        ref={triggerRef}
        variant="plain"
        color={value ? "primary" : "neutral"}
        onClick={() => setIsOpen((open) => !open)}
        title={value ? "Change status emoji" : "Add status emoji"}
        aria-label="Choose status emoji"
        aria-expanded={isOpen}
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
      {isOpen && (
        <Portal>
          <div
            data-custom-status-emoji-picker
            ref={pickerRef}
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
              onSelectGif={() => setIsOpen(false)}
              onSelectSticker={() => setIsOpen(false)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </Portal>
      )}
    </>
  );
};
