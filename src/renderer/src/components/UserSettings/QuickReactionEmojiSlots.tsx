import { EmojiPicker } from "@components/Expression/EmojiPicker";
import { Button } from "@components/Button";
import { useAppStore } from "@hooks/useStores";
import type { AppStore } from "@stores/App.store";
import type { Expression } from "@stores/objects/Expression";
import { ALL_EMOJIS, type PickerEmoji } from "@utils/emojis/emojiPickerData";
import { getSpriteStyle, type SkinTone } from "@utils/emojis/emojiSprite";
import { formatColor } from "@mutualzz/ui-core";
import { Popover, Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";

const SlotButton = styled("button")(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: 8,
  border: `1px solid ${formatColor(theme.colors.neutral, {
    alpha: 30,
    format: "hexa"
  })}`,
  background: theme.colors.surface,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
}));

const Sprite = styled("span")<{ sheetX: number; sheetY: number }>(
  ({ sheetX, sheetY }) => ({
    ...getSpriteStyle(sheetX, sheetY, 24)
  })
);

const CustomEmojiImg = styled("img")({
  width: 24,
  height: 24,
  objectFit: "contain",
  borderRadius: 4
});

function resolveDisplay(key: string | undefined, app: AppStore) {
  if (!key) return null;

  if (key.startsWith("custom:")) {
    const expression = app.expressions.get(key.slice(7));
    if (!expression) return null;

    return {
      kind: "custom" as const,
      title: expression.name,
      url: expression.url
    };
  }

  const [unified, skinToneKey] = key.split(":");
  const tone = (skinToneKey || null) as SkinTone;
  const emoji = ALL_EMOJIS.find((entry) => entry.unified === unified);
  if (!emoji) return null;
  const variant = tone ? emoji.skinVariations?.[tone] : null;

  return {
    kind: "standard" as const,
    title: emoji.name,
    sheetX: variant ? variant.sheetX : emoji.sheetX,
    sheetY: variant ? variant.sheetY : emoji.sheetY
  };
}

const QuickReactionSlot = observer(function QuickReactionSlot({
  index,
  value,
  onChange,
  ariaLabel
}: {
  index: number;
  value: string | undefined;
  onChange: (key: string) => void;
  ariaLabel: string;
}) {
  const app = useAppStore();
  const [session, setSession] = useState(0);
  const [activeTab, setActiveTab] = useState<"emoji" | "gifs" | "stickers">(
    "emoji"
  );
  const display = resolveDisplay(value, app);

  const closePicker = () => setSession((current) => current + 1);

  const handleSelectEmoji = (emoji: PickerEmoji, skinTone: SkinTone) => {
    onChange(`${emoji.unified}:${skinTone ?? ""}`);
    closePicker();
  };

  const handleSelectCustomEmoji = (expression: Expression) => {
    onChange(`custom:${expression.id}`);
    closePicker();
  };

  return (
    <Popover
      key={`quick-reaction-slot-${index}-${session}`}
      placement="bottom"
      trigger={
        <SlotButton type="button" aria-label={ariaLabel}>
          {display?.kind === "standard" ? (
            <Sprite sheetX={display.sheetX} sheetY={display.sheetY} />
          ) : display?.kind === "custom" ? (
            <CustomEmojiImg src={display.url} alt={display.title} draggable={false} />
          ) : (
            <Typography level="body-sm" textColor="muted">
              +
            </Typography>
          )}
        </SlotButton>
      }
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
});

export const QuickReactionEmojiSlots = observer(
  ({
    value,
    onChange
  }: {
    value: string[];
    onChange: (value: string[]) => void;
  }) => {
    const { t } = useTranslation("settings");
    const slots = [0, 1, 2];

    const setSlot = (index: number, key: string) => {
      const next = [...value];
      next[index] = key;
      onChange(next.slice(0, 3));
    };

    return (
      <Stack direction="column" spacing={1.5}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          {slots.map((index) => (
            <QuickReactionSlot
              key={index}
              index={index}
              value={value[index]}
              onChange={(key) => setSlot(index, key)}
              ariaLabel={t("composer.quickReactionSlot", { index: index + 1 })}
            />
          ))}
          <Button
            variant="plain"
            size="sm"
            onClick={() => onChange([])}
            disabled={value.length === 0}
          >
            {t("composer.clearQuickReactions")}
          </Button>
        </Stack>
        <Typography level="body-xs" textColor="muted">
          {t("composer.quickReactionsDescription")}
        </Typography>
      </Stack>
    );
  }
);
