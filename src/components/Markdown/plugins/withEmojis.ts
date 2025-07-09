import { getEmoji } from "@utils/emojis";
import { slateToMarkdown } from "@utils/slateToMarkdown";

import emojiRegex from "emojibase-regex";
import shortcodeRegex from "emojibase-regex/shortcode";
import { Range, Text, type Editor, type Element } from "slate";
import type { EmojiElement } from "types/slate";

export const withEmojis = (editor: Editor) => {
    const { isInline, isVoid, markableVoid, insertText, insertData } = editor;

    editor.isInline = (element: Element) => {
        return element.type === "emoji" ? true : isInline(element);
    };

    editor.isVoid = (element: Element) => {
        return element.type === "emoji" ? true : isVoid(element);
    };

    editor.markableVoid = (element: Element) => {
        return element.type === "emoji" || markableVoid(element);
    };

    editor.isSelectable = (element: Element) => {
        return element.type !== "emoji";
    };

    editor.insertText = (text: string) => {
        const { selection } = editor;

        if (selection) {
            if (Range.isCollapsed(selection)) {
                const nodeEntry = editor.node(selection.anchor.path);
                if (!Text.isText(nodeEntry[0])) {
                    insertText(text);
                    return;
                }

                const textNode = nodeEntry[0];
                const caretOffset = selection.anchor.offset;
                const combined = textNode.text.slice(0, caretOffset) + text;

                const shortcodeMatch = shortcodeRegex.exec(combined);
                if (shortcodeMatch) {
                    const shortcode = shortcodeMatch[0];
                    const distance = shortcode.length - 1;

                    const emoji = getEmoji(shortcode.replace(/:/g, ""));
                    if (!emoji) {
                        insertText(text);
                        return;
                    }

                    if (distance <= caretOffset) {
                        const shortcodeStart = editor.before(selection, {
                            unit: "character",
                            distance,
                        });

                        if (shortcodeStart) {
                            const shortcodeRange: Range = {
                                anchor: shortcodeStart,
                                focus: selection.anchor,
                            };

                            editor.select(shortcodeRange);
                            editor.delete();
                            insertEmoji(editor, emoji);

                            return;
                        }
                    }
                }

                const emojiMatch = emojiRegex.exec(text);
                if (emojiMatch) {
                    const emoji = getEmoji(emojiMatch[0]);
                    if (emoji) {
                        setTimeout(() => {
                            editor.select(selection.focus);
                            insertEmoji(editor, emoji);
                            const pointAfter = editor.after(selection.focus, {
                                unit: "character",
                            });
                            if (pointAfter) {
                                editor.select(pointAfter);
                                editor.delete();
                            }
                        }, 0);
                    }
                }
            }
        }

        insertText(text);
    };

    editor.insertData = (data: DataTransfer) => {
        const text = data.getData("text/plain");
        const shortcodeMatch = shortcodeRegex.exec(text);
        if (shortcodeMatch) {
            const emoji = getEmoji(shortcodeMatch[0].replace(/:/g, ""));
            if (emoji) {
                insertEmoji(editor, emoji);
                return;
            }
        }
        insertData(data);
    };

    editor.setFragmentData = (data: DataTransfer) => {
        const { selection } = editor;
        if (!selection) return;

        const fragment = editor.fragment(selection);
        const markdown = slateToMarkdown(fragment);
        data.setData("text/plain", markdown);
    };

    return editor;
};

const insertEmoji = (editor: Editor, emoji: ReturnType<typeof getEmoji>) => {
    if (!emoji) return;

    const emojiElement: EmojiElement = {
        type: "emoji",
        url: `/assets/emojis/${emoji.hexcode.toLowerCase()}.svg`,
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
