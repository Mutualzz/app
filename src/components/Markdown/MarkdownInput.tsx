import { useTheme } from "@ui/index";
import { isKeyHotkey } from "is-hotkey";
import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
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
import type { MarkdownInputProps } from "../../routes/ui/data-display/Markdown.types";
import { markdownToSlate } from "../../utils/markdownToSlate";
import { slateToMarkdown } from "../../utils/slateToMarkdown";
import { Element } from "./Element";
import { Leaf } from "./Leaf";
import {
    parseMarkdownToRanges,
    resolveMarkdownStyles,
    withEmojis,
    withShortcuts,
} from "./Markdown.helpers";

export const MarkdownInput = ({
    color = "neutral",
    textColor = "inherit",
    variant = "outlined",
    disabled = false,

    onChange,
    placeholder,
    onEnter,
    value,

    css,
}: MarkdownInputProps) => {
    const { theme } = useTheme();

    const [editorValue, setEditorValue] = useState(
        markdownToSlate(value ?? ""),
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
        (newValue: Descendant[]) => {
            if (onChange) {
                const markdown = slateToMarkdown(newValue);
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
