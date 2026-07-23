import type { AppStore } from "@stores/App.store";
import type { Expression } from "@stores/objects/Expression";
import type { RecentEmoji } from "@renderer/hooks/useRecentEmojis";
import {
  ALL_EMOJIS,
  type PickerEmoji
} from "@utils/emojis/emojiPickerData";
import type { SkinTone } from "@utils/emojis/emojiSprite";
import {
  expressionToReactionEmoji,
  pickerEmojiToReactionEmoji
} from "@mutualzz/client";
import type { APIMessageReactionEmoji } from "@mutualzz/types";

export type QuickReactionItem =
  | {
      key: string;
      kind: "standard";
      emoji: PickerEmoji;
      skinTone: SkinTone;
      sheetX: number;
      sheetY: number;
      title: string;
      toReaction: () => APIMessageReactionEmoji;
    }
  | {
      key: string;
      kind: "custom";
      expression: Expression;
      title: string;
      toReaction: () => APIMessageReactionEmoji;
    };

const resolveFavoriteKey = (
  key: string,
  app: AppStore
): QuickReactionItem | null => {
  if (key.startsWith("custom:")) {
    const id = key.slice(7);
    const expression = app.expressions.get(id);
    if (!expression) return null;

    return {
      key: `custom:${id}`,
      kind: "custom",
      expression,
      title: expression.name,
      toReaction: () => expressionToReactionEmoji(expression)
    };
  }

  const [unified, skinToneKey] = key.split(":");
  const tone = (skinToneKey || null) as SkinTone;
  const emoji = ALL_EMOJIS.find((entry) => entry.unified === unified);
  if (!emoji) return null;

  const variant = tone ? emoji.skinVariations?.[tone] : null;

  return {
    key,
    kind: "standard",
    emoji,
    skinTone: tone,
    sheetX: variant ? variant.sheetX : emoji.sheetX,
    sheetY: variant ? variant.sheetY : emoji.sheetY,
    title: emoji.name,
    toReaction: () => pickerEmojiToReactionEmoji(emoji, tone)
  };
};

const resolveRecent = (
  recent: RecentEmoji,
  app: AppStore
): QuickReactionItem | null => {
  if (recent.type === "standard" && recent.unified) {
    const tone = (recent.skinTone ?? null) as SkinTone;
    const emoji = ALL_EMOJIS.find((entry) => entry.unified === recent.unified);
    if (!emoji) return null;

    const variant = tone ? emoji.skinVariations?.[tone] : null;
    const key = `${emoji.unified}:${tone ?? ""}`;

    return {
      key,
      kind: "standard",
      emoji,
      skinTone: tone,
      sheetX: variant ? variant.sheetX : emoji.sheetX,
      sheetY: variant ? variant.sheetY : emoji.sheetY,
      title: emoji.name,
      toReaction: () => pickerEmojiToReactionEmoji(emoji, tone)
    };
  }

  if (recent.type === "custom" && recent.id) {
    const expression = app.expressions.get(recent.id);
    if (!expression) return null;

    return {
      key: `custom:${recent.id}`,
      kind: "custom",
      expression,
      title: expression.name,
      toReaction: () => expressionToReactionEmoji(expression)
    };
  }

  return null;
};

export const getQuickReactionItems = (
  app: AppStore,
  recents: RecentEmoji[],
  limit = 3
): QuickReactionItem[] => {
  const items: QuickReactionItem[] = [];
  const seen = new Set<string>();

  for (const key of app.settings?.extendedSettings.quickReactionEmojis ?? []) {
    if (items.length >= limit) break;

    const item = resolveFavoriteKey(key, app);
    if (!item || seen.has(item.key)) continue;

    seen.add(item.key);
    items.push(item);
  }

  for (const key of app.settings?.favoriteEmojis ?? []) {
    if (items.length >= limit) break;

    const item = resolveFavoriteKey(key, app);
    if (!item || seen.has(item.key)) continue;

    seen.add(item.key);
    items.push(item);
  }

  for (const recent of recents) {
    if (items.length >= limit) break;

    const item = resolveRecent(recent, app);
    if (!item || seen.has(item.key)) continue;

    seen.add(item.key);
    items.push(item);
  }

  return items;
};
