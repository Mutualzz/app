import emojiData from "emojibase-data/en/data.json";
import shortcodesCldrNative from "emojibase-data/en/shortcodes/cldr-native.json";
import shortcodesCldr from "emojibase-data/en/shortcodes/cldr.json";
import shortcodesEmojiBase from "emojibase-data/en/shortcodes/emojibase.json";
import shortcodesGithub from "emojibase-data/en/shortcodes/github.json";
import shortcodesIamcal from "emojibase-data/en/shortcodes/iamcal.json";
import shortcodesJoyPixels from "emojibase-data/en/shortcodes/joypixels.json";

import { joinShortcodes } from "emojibase";
import { useAppStore } from "@hooks/useStores.ts";

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
