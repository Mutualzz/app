import emojiData from "emojibase-data/en/data.json";
import shortcodesCldrNative from "emojibase-data/en/shortcodes/cldr-native.json";
import shortcodesCldr from "emojibase-data/en/shortcodes/cldr.json";
import shortcodesEmojiBase from "emojibase-data/en/shortcodes/emojibase.json";
import shortcodesGithub from "emojibase-data/en/shortcodes/github.json";
import shortcodesIamcal from "emojibase-data/en/shortcodes/iamcal.json";
import shortcodesJoyPixels from "emojibase-data/en/shortcodes/joypixels.json";

import type { EmojiSuggestion } from "@ui/index";
import { joinShortcodes, type Emoji } from "emojibase";

const shortcodes = [
    shortcodesEmojiBase,
    shortcodesJoyPixels,
    shortcodesCldrNative,
    shortcodesGithub,
    shortcodesIamcal,
    shortcodesCldr,
];

const emojis = joinShortcodes(emojiData, shortcodes);

export function getEmoji(
    shortcodeOrUnicodeOrEmoticon: string,
): Emoji | undefined {
    const emoji = emojis.find(
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

    const target =
        emoji?.skins?.find(
            (skin) =>
                skin.shortcodes?.includes(shortcodeOrUnicodeOrEmoticon) ||
                skin.emoji === shortcodeOrUnicodeOrEmoticon ||
                skin.emoticon === shortcodeOrUnicodeOrEmoticon,
        ) ?? emoji;

    return target;
}

export function getEmojiSuggestions(
    query: string,
    limit = 10,
): EmojiSuggestion[] {
    if (query.length < 1) return [];

    const lowerQuery = query.toLowerCase();
    const results: EmojiSuggestion[] = [];

    for (const emoji of emojiData) {
        if (emoji.shortcodes?.some((s) => s.startsWith(lowerQuery))) {
            results.push({
                emoji: emoji.emoji,
                shortcode: emoji.shortcodes[0],
            });
        }

        for (const skin of emoji.skins ?? []) {
            if (skin.shortcodes?.some((s) => s.startsWith(lowerQuery))) {
                results.push({
                    emoji: skin.emoji,
                    shortcode: skin.shortcodes[0],
                });
            }
        }

        if (results.length >= limit) break;
    }

    return results;
}
