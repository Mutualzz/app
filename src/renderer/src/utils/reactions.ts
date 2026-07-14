import type {
  APIMessageReaction,
  APIMessageReactionEmoji,
  APIMessageReactionEvent,
  APIMessageReactionRemoveEmojiEvent,
  APIMessageReactionRemoveEvent
} from "@mutualzz/types";
import type { Expression } from "@stores/objects/Expression";
import type { PickerEmoji } from "@utils/emojis/emojiPickerData";
import type { SkinTone } from "@utils/emojis/emojiSprite";

const unifiedToEmoji = (unified: string) =>
  unified
    .split("-")
    .map((code) => String.fromCodePoint(parseInt(code, 16)))
    .join("");

export const reactionEmojisMatch = (
  a: APIMessageReactionEmoji,
  b: APIMessageReactionEmoji
) => {
  if (a.type === "unicode" && b.type === "unicode") return a.value === b.value;
  if (a.type === "expression" && b.type === "expression") {
    return a.expression.id === b.expression.id;
  }
  return false;
};

export const reactionEmojiToBody = (emoji: APIMessageReactionEmoji) => {
  if (emoji.type === "unicode") {
    return { emoji: { type: "unicode", value: emoji.value } };
  }

  return {
    emoji: { type: "expression", id: emoji.expression.id }
  };
};

export const pickerEmojiToReactionEmoji = (
  emoji: PickerEmoji,
  skinTone: SkinTone
): APIMessageReactionEmoji => {
  const unified =
    (skinTone && emoji.skinVariations?.[skinTone]?.unified) || emoji.unified;

  return {
    type: "unicode",
    value: unifiedToEmoji(unified)
  };
};

export const expressionToReactionEmoji = (
  expression: Expression
): APIMessageReactionEmoji => ({
  type: "expression",
  expression: expression.toJSON()
});

export const applyReactionAdd = (
  reactions: APIMessageReaction[],
  payload: APIMessageReactionEvent,
  meId?: string
) => {
  const existing = reactions.find((reaction) =>
    reactionEmojisMatch(reaction.emoji, payload.emoji)
  );

  if (existing) {
    if (payload.userId === meId && existing.me) return reactions;

    return reactions.map((reaction) =>
      reactionEmojisMatch(reaction.emoji, payload.emoji)
        ? {
            ...reaction,
            count: reaction.count + 1,
            me: payload.userId === meId ? true : reaction.me
          }
        : reaction
    );
  }

  return [
    ...reactions,
    {
      emoji: payload.emoji,
      count: 1,
      me: payload.userId === meId
    }
  ];
};

export const applyReactionRemove = (
  reactions: APIMessageReaction[],
  payload: APIMessageReactionRemoveEvent,
  meId?: string
) => {
  const index = reactions.findIndex((reaction) =>
    reactionEmojisMatch(reaction.emoji, payload.emoji)
  );
  if (index === -1) return reactions;

  const existing = reactions[index];
  if (payload.userId === meId && !existing.me) return reactions;

  if (existing.count <= 1) {
    return reactions.filter((_, reactionIndex) => reactionIndex !== index);
  }

  const next = [...reactions];
  next[index] = {
    ...existing,
    count: existing.count - 1,
    me: payload.userId === meId ? false : existing.me
  };
  return next;
};

export const applyReactionRemoveEmoji = (
  reactions: APIMessageReaction[],
  payload: APIMessageReactionRemoveEmojiEvent
) =>
  reactions.filter(
    (reaction) => !reactionEmojisMatch(reaction.emoji, payload.emoji)
  );
