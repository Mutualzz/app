import { useTheme } from "@ui/index";
import { isKeyHotkey } from "is-hotkey";
import { useCallback, useMemo, type KeyboardEvent } from "react";
import {
    createEditor,
    Path,
    Range,
    Element as SlateElement,
    Text,
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
import { getEmojiWithShortcode } from "../../utils/emojis";
import { Element } from "./Element";
import { Leaf } from "./Leaf";
import {
    insertEmoji,
    parseMarkdownToRanges,
    resolveMarkdownStyles,
    withEmojis,
    withShortcuts,
} from "./Markdown.helpers";
import type { MarkdownProps } from "./Markdown.types";

const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [{ text: "" }],
    },
];

export const Markdown = ({
    color = "neutral",
    textColor = "inherit",
    variant = "outlined",
    disabled = false,

    onChange,
    placeholder,
    onEnter,

    css,
}: MarkdownProps) => {
    const { theme } = useTheme();

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
        if (!Text.isText(node)) return [];

        return parseMarkdownToRanges(node.text, path);
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
            if (e.key === "Enter" && e.shiftKey) handleShiftEnter(e);

            if (e.key === "Enter" && !e.shiftKey) {
                if (onEnter) {
                    e.preventDefault();
                    editor.select(editor.start([]));
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
                    editor.move({
                        unit: "offset",
                        reverse: true,
                    });
                }

                if (isKeyHotkey("right", nativeEvent)) {
                    e.preventDefault();
                    editor.move({
                        unit: "offset",
                        reverse: false,
                    });
                }
            }
        },
        [editor, onEnter, handleShiftEnter],
    );

    const handleChange = useCallback(
        (_newValue: Descendant[]) => {
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

                        editor.select(shortcodeRange);
                        editor.delete();

                        insertEmoji(editor, match[1], emoji);
                    }
                }
            }

            if (onChange) onChange("");
        },
        [editor, onChange],
    );

    return (
        <Slate
            initialValue={initialValue}
            onChange={(newValue) => {
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
                    height: "100%",
                    padding: "0.5em",
                    minWidth: 0,
                    boxSizing: "border-box",
                    ...resolveMarkdownStyles(theme, color, textColor)[variant],
                    ...(disabled && {
                        opacity: 0.5,
                        pointerEvents: "none",
                    }),
                    ...css,
                }}
                disabled={disabled}
                disableDefaultStyles
                spellCheck
            />
        </Slate>
    );
};
