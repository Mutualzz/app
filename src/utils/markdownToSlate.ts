import shortcodeRegex from "emojibase-regex/shortcode";
import type { Descendant, Text } from "slate";
import { getEmoji } from "./emojis";

export function markdownToSlate(markdown: string): Descendant[] {
    const lines = markdown.split(/\r?\n/);
    const result: Descendant[] = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === "") {
            result.push({ type: "line", children: [{ text: "" }] });
            continue;
        }

        const headingMatch = /^#{1,3} /.exec(trimmed);
        if (headingMatch) {
            const level = headingMatch[0].trim().length as 1 | 2 | 3;
            result.push({
                type: "heading",
                level,
                children: parseInlineMarkdown(trimmed.slice(level + 1)),
            });
            continue;
        }

        if (trimmed.startsWith(">")) {
            result.push({
                type: "blockquote",
                children: [
                    {
                        type: "line",
                        children: parseInlineMarkdown(
                            trimmed.replace(/^>\s?/, ""),
                        ),
                    },
                ],
            });
            continue;
        }

        result.push({
            type: "line",
            children: parseInlineMarkdown(trimmed),
        });
    }

    return result;
}

function parseInlineMarkdown(input: string): Descendant[] {
    const nodes: Descendant[] = [];

    function tokenize(text: string): (Text | Descendant)[] {
        const linkMatch = /\[([^[\]\n]+)\]\(([^()\s]+)\)/.exec(text);
        if (linkMatch) {
            const before = text.slice(0, linkMatch.index);
            const label = linkMatch[1];
            const url = linkMatch[2];
            const after = text.slice(linkMatch.index + linkMatch[0].length);

            return [
                ...tokenize(before),
                {
                    type: "link",
                    url,
                    children: tokenize(label),
                },
                ...tokenize(after),
            ];
        }

        const patterns: [RegExp, Partial<Text>][] = [
            [/\*\*(.*?)\*\*/s, { bold: true }],
            [/\*(.*?)\*/s, { italic: true }],
            [/_(.*?)_/s, { italic: true }],
            [/~~(.*?)~~/s, { strikethrough: true }],
            [/`(.*?)`/s, { code: true }],
            [/__([^_]+)__/s, { underline: true }],
            [/\|\|(.+?)\|\|/s, { spoiler: true }],
        ];

        for (const [pattern, mark] of patterns) {
            const match = pattern.exec(text);
            if (match) {
                const before = text.slice(0, match.index);
                const inner = match[1];
                const after = text.slice(match.index + match[0].length);

                return [
                    ...tokenize(before),
                    ...tokenize(inner).map((node) =>
                        "text" in node ? { ...mark, text: node.text } : node,
                    ),
                    ...tokenize(after),
                ];
            }
        }

        const emojiMatch = shortcodeRegex.exec(text);
        if (emojiMatch) {
            const before = text.slice(0, emojiMatch.index);
            const shortcode = emojiMatch[0].toLowerCase().replaceAll(/:/g, "");
            const after = text.slice(emojiMatch.index + emojiMatch[0].length);

            const emoji = getEmoji(shortcode);
            const emojiNode: Descendant = emoji
                ? {
                      type: "emoji",
                      name: `:${emoji.shortcodes?.[0]}:`,
                      url: `/assets/emojis/${emoji.hexcode.toLowerCase()}.png`,
                      unicode: emoji.emoji,
                      children: [{ text: "" }],
                  }
                : { text: `:${shortcode}:` };

            return [...tokenize(before), emojiNode, ...tokenize(after)];
        }

        return text ? [{ text }] : [];
    }

    nodes.push(...tokenize(input));
    return nodes;
}
