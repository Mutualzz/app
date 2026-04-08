import emojiData from "emojibase-data/en/data.json";
import shortcodesCldrNative from "emojibase-data/en/shortcodes/cldr-native.json";
import shortcodesCldr from "emojibase-data/en/shortcodes/cldr.json";
import shortcodesEmojiBase from "emojibase-data/en/shortcodes/emojibase.json";
import shortcodesGithub from "emojibase-data/en/shortcodes/github.json";
import shortcodesIamcal from "emojibase-data/en/shortcodes/iamcal.json";
import shortcodesJoyPixels from "emojibase-data/en/shortcodes/joypixels.json";

import { joinShortcodes } from "emojibase";
import { useAppStore } from "@hooks/useStores.ts";
import { type Editor, Range, Text } from "slate";
import type { CustomEmojiElement, EmojiElement } from "@app-types/slate";
import { TWEMOJI_URL } from "@utils/urls.ts";
import type { Expression } from "@stores/objects/Expression.ts";

const shortcodes = [
    shortcodesEmojiBase,
    shortcodesJoyPixels,
    shortcodesCldrNative,
    shortcodesGithub,
    shortcodesIamcal,
    shortcodesCldr,
];

export const defaultEmojis = joinShortcodes(emojiData, shortcodes);

export function getEmoji(shortcodeOrUnicodeOrEmoticon: string) {
    const emoji = defaultEmojis.find(
        (e) =>
            e.shortcodes?.includes(shortcodeOrUnicodeOrEmoticon) ||
            e.emoji === shortcodeOrUnicodeOrEmoticon ||
            e.skins?.some(
                (skin) =>
                    skin.shortcodes?.includes(shortcodeOrUnicodeOrEmoticon) ||
                    skin.emoji === shortcodeOrUnicodeOrEmoticon,
            ) ||
            e.emoticon === shortcodeOrUnicodeOrEmoticon,
    );

    return (
        emoji?.skins?.find(
            (skin) =>
                skin.shortcodes?.includes(shortcodeOrUnicodeOrEmoticon) ||
                skin.emoji === shortcodeOrUnicodeOrEmoticon ||
                skin.emoticon === shortcodeOrUnicodeOrEmoticon,
        ) ?? emoji
    );
}

export async function getCustomEmoji(shortcode: string) {
    if (!shortcode.startsWith("<") || !shortcode.endsWith(">")) return null;

    const app = useAppStore();

    const inner = shortcode.slice(1, -1);
    const parts = inner.split(":");

    if (parts.length !== 3) return null;

    const [animatedFlag, name, id] = parts;
    if (!name || !id) return null;

    const isAnimated = animatedFlag === "a";
    let expression =
        app.expressions.emojis.find(
            (e) => e.name === name && e.id === id && e.animated === isAnimated,
        ) ||
        app.spaces.all
            .map((sp) =>
                Array.from(sp.expressions.values()).find(
                    (exp) =>
                        exp.id === id &&
                        exp.name === name &&
                        exp.animated === isAnimated,
                ),
            )
            .find((exp) => exp !== undefined);

    if (!expression) expression = await app.expressions.resolve(id, true);
    if (!expression) return null;

    return expression;
}

export function useShortcodeQuery(editor: Editor): {
    query: string | null;
    range: Range | null;
} {
    const { selection } = editor;
    if (!selection || !Range.isCollapsed(selection))
        return { query: null, range: null };

    const { anchor } = selection;
    const [node] = editor.node(anchor.path);

    if (!Text.isText(node)) return { query: null, range: null };

    const textBefore = node.text.slice(0, anchor.offset);

    const match = /:([\w+-]{2,})$/.exec(textBefore);
    if (!match) return { query: null, range: null };

    const colonOffset = match.index;
    const [, query] = match;

    const rangeStart = { path: anchor.path, offset: colonOffset };

    return { query, range: { anchor: rangeStart, focus: anchor } };
}

export const insertEmoji = (
    editor: Editor,
    emoji: ReturnType<typeof getEmoji>,
) => {
    if (!emoji) return;

    const emojiElement: EmojiElement = {
        type: "emoji",
        url: `${TWEMOJI_URL}/${emoji.hexcode.toLowerCase()}.svg`,
        children: [{ text: emoji.emoji }],
        unicode: emoji.emoji,
        name: emoji.shortcodes?.[0] ?? emoji.emoji,
    };

    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
        editor.insertNode(emojiElement, {
            at: selection.anchor,
        });

        const pointAfter = editor.after(selection.focus);
        if (pointAfter) editor.select(pointAfter);
    }
};

export const insertCustomEmoji = (editor: Editor, emoji: Expression) => {
    const childrenText = emoji.animated
        ? `<a:${emoji.name}:${emoji.id}>`
        : `<:${emoji.name}:${emoji.id}>`;

    const emojiElement: CustomEmojiElement = {
        type: "customEmoji",
        url: emoji.url,
        children: [{ text: childrenText }],
        name: emoji.name,
        id: emoji.id,
        animated: emoji.animated,
    };

    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
        editor.insertNode(emojiElement, { at: selection.anchor });

        const pointAfter = editor.after(selection.focus);
        if (pointAfter) editor.select(pointAfter);
    }
};
