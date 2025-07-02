import emojiData from "emojibase-data/en/data.json";
import shortcodesEmojiBase from "emojibase-data/en/shortcodes/emojibase.json";
import shortcodesGithub from "emojibase-data/en/shortcodes/github.json";
import shortcodesJoyPixels from "emojibase-data/en/shortcodes/joypixels.json";

import type { EmojiSuggestion } from "@ui/index";
import { mergeAppendAnything } from "./index";

const shortcodes = mergeAppendAnything(
    shortcodesEmojiBase,
    shortcodesJoyPixels,
    shortcodesGithub,
);

const emojiMap = emojiData.map((em) => ({
    ...em,
    shortcodes: shortcodes[em.hexcode] ?? [],
}));

export function getEmojiWithShortcode(shortcode: string) {
    const emoji = emojiMap.find(
        (e) =>
            e.shortcodes.includes(shortcode) ||
            e.emoji === shortcode ||
            e.skins?.some((s) => s.shortcodes?.includes(shortcode)),
    );

    const target =
        emoji?.skins?.find((s) => s.shortcodes?.includes(shortcode)) ?? emoji;

    return target;
}

export function getEmojiWithUnicode(unicode: string) {
    const emoji = emojiMap.find(
        (e) => e.emoji === unicode || e.skins?.some((s) => s.emoji === unicode),
    );

    const target = emoji?.skins?.find((s) => s.emoji === unicode) ?? emoji;

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
