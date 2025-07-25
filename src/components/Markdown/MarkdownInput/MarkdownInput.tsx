import { HoverToolbar } from "@components/HoverToolbar/HoverToolbar";
import { useTheme } from "@mutualzz/ui";
import { markdownToSlate } from "@utils/markdownToSlate";
import { getActiveFormats } from "@utils/markdownUtils";
import { slateToMarkdown } from "@utils/slateToMarkdown";
import { wrapSelectionWith } from "@utils/wrapSelectionWith";
import isHotkey from "is-hotkey";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type KeyboardEvent,
} from "react";
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
import { Element } from "./Element";
import { Leaf } from "./Leaf";
import { MarkdownInputContext } from "./MarkdownInput.context";
import {
    parseMarkdownToRanges,
    resolveMarkdownStyles,
} from "./MarkdownInput.helpers";
import type { MarkdownInputProps } from "./MarkdownInput.types";
import { withEmojis } from "./plugins/withEmojis";
import { withSyntax } from "./plugins/withSyntax";

export const MarkdownInput = ({
    color = "neutral",
    textColor = "inherit",
    variant = "outlined",
    disabled = false,

    autoFocus = false,
    emoticons = true,
    hoverToolbar = true,

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
        () => withSyntax(withEmojis(withHistory(withReact(createEditor())))),
        [],
    );

    const formats = getActiveFormats(editor, editor.selection);

    useEffect(() => {
        editor.enableEmoticons = emoticons;
    }, [editor, emoticons]);

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
                        type: "line",
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
            if (isHotkey("mod+a", e)) {
                e.preventDefault();
                editor.select({
                    anchor: editor.start([]),
                    focus: editor.end([]),
                });
                return;
            }

            if (isHotkey("mod+b", e)) {
                e.preventDefault();
                wrapSelectionWith(editor, "**", formats);
                return;
            }

            if (isHotkey("mod+i", e)) {
                e.preventDefault();
                wrapSelectionWith(editor, "*", formats);
                return;
            }

            if (isHotkey("mod+u", e)) {
                e.preventDefault();
                wrapSelectionWith(editor, "__", formats);
                return;
            }

            if (isHotkey("mod+s", e)) {
                e.preventDefault();
                wrapSelectionWith(editor, "~~", formats);
                return;
            }

            if (e.key === "Backspace") {
                const { selection } = editor;

                if (selection && Range.isExpanded(selection)) {
                    const blockEntry = editor.above({
                        match: (n) =>
                            SlateElement.isElement(n) && editor.isBlock(n),
                    });

                    if (blockEntry) {
                        const [blockNode, blockPath] = blockEntry;

                        if (
                            SlateElement.isElement(blockNode) &&
                            (blockNode.type === "heading" ||
                                blockNode.type === "blockquote")
                        ) {
                            const blockText = editor.string(blockPath);
                            const selectedText = editor.string(selection);

                            if (blockText === selectedText) {
                                e.preventDefault();
                                editor.delete();
                                editor.setNodes(
                                    { type: "line" },
                                    { at: blockPath },
                                );
                                return;
                            }
                        }
                    }
                }
            }

            if (e.key === "Enter" && e.shiftKey) handleShiftEnter(e);

            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (onEnter) {
                    editor.select({
                        anchor: editor.start([]),
                        focus: editor.end([]),
                    });
                    editor.delete();
                    onEnter();
                }
            }

            const { selection } = editor;

            if (selection && Range.isCollapsed(selection)) {
                if (isHotkey("left", e)) {
                    e.preventDefault();
                    editor.move({
                        unit: "offset",
                        reverse: true,
                    });
                }

                if (isHotkey("right", e)) {
                    e.preventDefault();
                    editor.move({
                        unit: "offset",
                        reverse: false,
                    });
                }
            }
        },
        [editor, onEnter, handleShiftEnter, formats],
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
        <MarkdownInputContext.Provider
            value={{
                activeFormats: formats,
                enableEmoticons: emoticons,
                enableHoverToolbar: hoverToolbar,
            }}
        >
            <Slate
                initialValue={editorValue}
                onChange={(newValue) => {
                    setEditorValue(newValue);
                    handleChange(newValue);
                }}
                editor={editor}
            >
                <HoverToolbar />
                <Editable
                    autoFocus={autoFocus}
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
                        ...resolveMarkdownStyles(theme, color, textColor)[
                            variant
                        ],
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
        </MarkdownInputContext.Provider>
    );
};
