import { getCustomEmoji, getEmoji, insertCustomEmoji, insertEmoji, } from "@utils/emojis";
import { slateToMarkdown } from "@utils/slateToMarkdown";
import emojiRegex from "emojibase-regex";
import baseEmoticonRegex from "emojibase-regex/emoticon";
import shortcodeRegex from "emojibase-regex/shortcode";
import { type Editor, Element, Path, Range, Text, type TextUnit } from "slate";
import { useAppStore } from "@hooks/useStores.ts";
import { canUseCustomEmoji } from "@utils/index.ts";

const extendedEmoticons = [":3", ">.<", "T^T", "T_T", "x_x"];

const escapedCustom = extendedEmoticons
    .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

const combinedPattern = `(?:${baseEmoticonRegex.source}|${escapedCustom})`;
const emoticonRegex = new RegExp(`(${combinedPattern})(?=\\s)`, "g");

export const withEmojis = (editor: Editor) => {
    const app = useAppStore();

    const {
        deleteBackward,
        deleteForward,
        isInline,
        isVoid,
        markableVoid,
        insertText,
    } = editor;

    editor.isInline = (element: Element) => {
        return element.type === "emoji" || element.type === "customEmoji"
            ? true
            : isInline(element);
    };

    editor.isVoid = (element: Element) => {
        return element.type === "emoji" || element.type === "customEmoji"
            ? true
            : isVoid(element);
    };

    editor.markableVoid = (element: Element) => {
        return (
            element.type === "emoji" ||
            element.type === "customEmoji" ||
            markableVoid(element)
        );
    };

    editor.isSelectable = (element: Element) => {
        return element.type !== "emoji" && element.type !== "customEmoji";
    };

    editor.insertText = async (text: string) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const nodeEntry = editor.node(selection.anchor.path);
            if (!Text.isText(nodeEntry[0])) {
                insertText(text);
                return;
            }

            const textNode = nodeEntry[0];
            const caretOffset = selection.anchor.offset;
            const combined = textNode.text.slice(0, caretOffset) + text;

            const customEmojiRegex = /<a?:[^:]+:\d+>/g;
            const customMatch = customEmojiRegex.exec(combined);
            if (
                customMatch &&
                customMatch.index + customMatch[0].length === combined.length
            ) {
                const shortcode = customMatch[0];
                const customEmoji = await getCustomEmoji(shortcode);
                const me = app.spaces.active?.members.me;
                const channel = app.channels.active;
                if (
                    customEmoji &&
                    canUseCustomEmoji(customEmoji, me, channel)
                ) {
                    const distance = shortcode.length - text.length;
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
                            insertCustomEmoji(editor, customEmoji);
                            return;
                        }
                    }
                }
            }

            const shortcodeMatch = shortcodeRegex.exec(combined);
            if (
                shortcodeMatch &&
                shortcodeMatch.index + shortcodeMatch[0].length ===
                    combined.length
            ) {
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

            if (editor.enableEmoticons) {
                const emoticonMatch = emoticonRegex.exec(combined);
                if (emoticonMatch) {
                    const emoticon = emoticonMatch[0].trim();
                    const emoji = getEmoji(emoticon);
                    if (!emoji) {
                        insertText(text);
                        return;
                    }

                    const distance = emoticon.length;
                    if (distance <= caretOffset) {
                        const emoticonStart = editor.before(selection, {
                            unit: "character",
                            distance,
                        });

                        if (emoticonStart) {
                            const emoticonRange: Range = {
                                anchor: emoticonStart,
                                focus: selection.anchor,
                            };

                            editor.select(emoticonRange);
                            editor.delete();
                            insertEmoji(editor, emoji);
                            editor.insertText(" ");

                            return;
                        }
                    }
                }
            }
        }

        insertText(text);
    };

    editor.deleteForward = (unit: TextUnit) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const { path } = selection.anchor;
            const [node] = editor.node(path);

            if (
                Element.isElement(node) &&
                (node.type === "emoji" || node.type === "customEmoji")
            ) {
                editor.removeNodes({ at: path });
                return;
            }
        }

        deleteForward(unit);
    };

    editor.deleteBackward = (unit: TextUnit) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection) && unit === "character") {
            const { path, offset } = selection.anchor;

            const lastIndex = path[path.length - 1];
            if (offset === 0 && lastIndex > 0) {
                const prevPath = Path.previous(path);
                const [prevNode] = editor.node(prevPath);

                if (
                    Element.isElement(prevNode) &&
                    (prevNode.type === "emoji" ||
                        prevNode.type === "customEmoji")
                ) {
                    editor.removeNodes({ at: prevPath });
                    return;
                }
            }
        }

        deleteBackward(unit);
    };

    editor.insertData = async (data: DataTransfer) => {
        const text = data.getData("text/plain");
        const parts: any[] = [];
        let lastIndex = 0;

        const customEmojiPattern = /<a?:[^:]+:\d+>/g;
        const localShortcodeRegex = new RegExp(shortcodeRegex.source, "g");

        const allMatches: { index: number; text: string; isCustom: boolean }[] =
            [];

        let match;
        while ((match = localShortcodeRegex.exec(text)) !== null) {
            allMatches.push({
                index: match.index,
                text: match[0],
                isCustom: false,
            });
        }
        while ((match = customEmojiPattern.exec(text)) !== null) {
            allMatches.push({
                index: match.index,
                text: match[0],
                isCustom: true,
            });
        }
        allMatches.sort((a, b) => a.index - b.index);

        for (const m of allMatches) {
            if (m.index < lastIndex) continue; // skip overlapping

            const before = text.slice(lastIndex, m.index);
            if (before) parts.push({ type: "text", text: before });

            if (m.isCustom) {
                const customEmoji = await getCustomEmoji(m.text);

                const me = app.spaces.active?.members.me;
                const channel = app.channels.active;

                if (customEmoji && canUseCustomEmoji(customEmoji, me, channel))
                    parts.push({ type: "customEmoji", emoji: customEmoji });
                else parts.push({ type: "text", text: m.text });
            } else {
                const emoji = getEmoji(m.text.slice(1, -1));
                if (emoji) parts.push({ type: "emoji", emoji });
                else parts.push({ type: "text", text: m.text });
            }

            lastIndex = m.index + m.text.length;
        }

        const after = text.slice(lastIndex);
        if (after) parts.push({ type: "text", text: after });

        for (const part of parts) {
            if (part.type === "text") editor.insertText(part.text);
            else if (part.type === "emoji") insertEmoji(editor, part.emoji);
            else if (part.type === "customEmoji")
                insertCustomEmoji(editor, part.emoji);
        }
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
