import { isKeyHotkey } from "is-hotkey";
import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import {
    createEditor,
    Path,
    Range,
    Element as SlateElement,
    Text,
    Transforms,
    type Descendant,
    type Node,
} from "slate";
import { withHistory } from "slate-history";
import {
    Editable,
    Slate,
    withReact,
    type RenderElementProps,
    type RenderLeafProps,
} from "slate-react";
import { useTheme } from "../../ui/src/hooks/useTheme";
import { getEmojiWithShortcode } from "../../utils/emojis";
import { Element } from "./Element";
import { Leaf } from "./Leaf";
import {
    deseralizeFromMarkdown,
    insertEmoji,
    resolveMarkdownStyles,
    serializeToMarkdown,
    withEmojis,
    withShortcuts,
} from "./Markdown.helpers";
import type { MarkdownProps } from "./Markdown.types";

export const Markdown = ({
    color = "neutral",
    variant = "outlined",
    disabled = false,

    onChange,
    placeholder,
    onEnter,
    value,
}: MarkdownProps) => {
    const { theme } = useTheme();

    const [editorValue, setEditorValue] = useState<Descendant[]>(() =>
        serializeToMarkdown(value ?? ""),
    );

    const editor = useMemo(
        () => withShortcuts(withEmojis(withHistory(withReact(createEditor())))),
        [],
    );

    const renderElement = useCallback(
        (props: RenderElementProps) => <Element {...props} />,
        [],
    );

    const renderLeaf = useCallback(
        (props: RenderLeafProps) => <Leaf {...props} />,
        [],
    );

    const decorate = useCallback(([node, path]: [Node, number[]]): Range[] => {
        const ranges: Range[] = [];

        if (Text.isText(node)) {
            const { text } = node;

            const patterns = [
                { type: "bold", regex: /\*\*(.*?)\*\*/g }, // Bold (**bold**)
                { type: "italic", regex: /\*(.*?)\*/g }, // Italic (*italic*)
                { type: "strikethrough", regex: /~~(.*?)~~/g }, // Strikethrough (~~strikethrough~~)
                { type: "underline", regex: /__(.*?)__/g }, // Underlined (__underlined__)
            ];

            // NOTE: This makes it so it doesn't include markers in the ranges.
            // If you want to include the markers in the ranges, uncomment the following code block.
            // patterns.forEach(({ regex, type }) => {
            //     let match;
            //     while ((match = regex.exec(text)) !== null) {
            //         const fullMatch = match[0];
            //         const innerText = match[1];
            //         const markerLength =
            //             (fullMatch.length - innerText.length) / 2;

            //         const start = match.index + markerLength; // skip starting marker
            //         const end = start + innerText.length;

            //         ranges.push({
            //             [type]: true,
            //             anchor: { path, offset: start },
            //             focus: { path, offset: end },
            //         });
            //     }
            // });

            // NOTE: This includes the markers in the ranges.
            patterns.forEach(({ regex, type }) => {
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const start = match.index;
                    const end = start + match[0].length; // Entire match, including markers

                    ranges.push({
                        [type]: true,
                        anchor: { path, offset: start },
                        focus: { path, offset: end },
                    });
                }
            });

            // Handle inline code (single backticks), but only if it's not inside a code block
            const inlineCodeRegex = /`([^`]+)`/g;
            let match;
            while ((match = inlineCodeRegex.exec(text)) !== null) {
                const start = match.index; // include the starting backtick
                const end = start + match[0].length; // include ending backtick

                ranges.push({
                    code: true,
                    anchor: { path, offset: start },
                    focus: { path, offset: end },
                });
            }
        }

        return ranges;
    }, []);

    const handleShiftEnter = (e: KeyboardEvent) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            let [node, path] = editor.node(selection.focus.path);

            while (path.length > 1) {
                [node, path] = editor.node(path.slice(0, -1));
            }

            if (SlateElement.isElement(node)) {
                e.preventDefault();

                const newPath = Path.next(path);

                editor.insertNode(
                    {
                        type: "paragraph",
                        children: [{ text: "" }],
                    },
                    { at: newPath },
                );

                editor.select(editor.start(newPath));
            }
        }
    };

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Enter" && e.shiftKey) {
                handleShiftEnter(e);
            }

            if (e.key === "Enter" && !e.shiftKey) {
                if (onEnter) {
                    e.preventDefault();
                    Transforms.select(editor, editor.start([]));
                    onEnter();
                    editor.children = [
                        {
                            type: "paragraph",
                            children: [{ text: "" }],
                        },
                    ];
                }
            }

            const { selection } = editor;

            if (selection && Range.isCollapsed(selection)) {
                const { nativeEvent } = e;

                if (isKeyHotkey("left", nativeEvent)) {
                    e.preventDefault();
                    Transforms.move(editor, {
                        unit: "offset",
                        reverse: true,
                    });
                }

                if (isKeyHotkey("right", nativeEvent)) {
                    e.preventDefault();
                    Transforms.move(editor, {
                        unit: "offset",
                        reverse: false,
                    });
                }
            }
        },
        [editor, onEnter, handleShiftEnter],
    );

    const handleChange = useCallback(
        (newValue: Descendant[]) => {
            const { selection } = editor;

            if (selection && Range.isCollapsed(selection)) {
                const block = editor.above({
                    match: (n) =>
                        SlateElement.isElement(n) && editor.isBlock(n),
                });

                if (block) {
                    const path = block[1];
                    const start = editor.start(path);
                    const end = editor.end(path);

                    const blockRange: Range = {
                        anchor: start,
                        focus: end,
                    };
                    const blockText = editor.string(blockRange);
                    const match = /:(\w+):$/.exec(blockText);
                    if (match) {
                        const emoji = getEmojiWithShortcode(match[1]);
                        const shortcodeStart = editor.before(selection, {
                            unit: "character",
                            distance: match[0].length,
                        });

                        if (!shortcodeStart || !emoji) return;

                        const shortcodeRange: Range = {
                            anchor: shortcodeStart,
                            focus: selection.anchor,
                        };

                        Transforms.select(editor, shortcodeRange);
                        Transforms.delete(editor);

                        insertEmoji(editor, emoji);
                    }
                }
            }

            if (onChange) {
                const markdown = deseralizeFromMarkdown(newValue);
                onChange(markdown);
            }
        },
        [editor, onChange],
    );

    return (
        <Slate
            initialValue={editorValue}
            onChange={(newValue) => {
                setEditorValue(newValue);
                handleChange(newValue);
            }}
            editor={editor}
        >
            <Editable
                decorate={decorate}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                renderPlaceholder={({
                    children,
                    attributes: { style, ...attributes },
                }) => (
                    <span
                        {...attributes}
                        css={{
                            pointerEvents: "none",
                            userSelect: "none",
                            lineHeight: 1,
                            opacity: 0.3,
                            display: "block",
                            position: "absolute",
                            top: "0.5em",
                            left: "0.5em",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {children}
                    </span>
                )}
                css={{
                    display: "block",
                    position: "relative",
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    ...resolveMarkdownStyles(theme, color)[variant],
                    ...(disabled && {
                        opacity: 0.5,
                        pointerEvents: "none",
                    }),
                }}
                disabled={disabled}
                disableDefaultStyles
                spellCheck
            />
        </Slate>
    );
};
