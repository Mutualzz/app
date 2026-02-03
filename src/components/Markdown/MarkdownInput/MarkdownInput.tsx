import { resolveResponsiveMerge } from "@mutualzz/ui-core";
import { Typography, useTheme } from "@mutualzz/ui-web";
import { markdownToSlate } from "@utils/markdownToSlate";
import { getActiveFormats } from "@utils/markdownUtils";
import { slateToMarkdown } from "@utils/slateToMarkdown";
import { wrapSelectionWith } from "@utils/wrapSelectionWith";
import isHotkey from "is-hotkey";
import {
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type KeyboardEvent,
} from "react";
import {
    createEditor,
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
import { HoverToolbar } from "../HoverToolbar/HoverToolbar";
import { Element } from "./Element";
import { Leaf } from "./Leaf";
import { MarkdownInputContext } from "./MarkdownInput.context";
import {
    parseMarkdownToRanges,
    parseSpoilerRanges,
    resolveMarkdownStyles,
} from "./MarkdownInput.helpers";
import type { MarkdownInputProps } from "./MarkdownInput.types";
import { withEmojis } from "./plugins/withEmojis";
import { withSyntax } from "./plugins/withSyntax";

const MarkdownInput = forwardRef<HTMLDivElement, MarkdownInputProps>(
    (
        {
            color = "neutral",
            textColor = "inherit",
            variant = "outlined",
            disabled = false,

            autoFocus = false,
            emoticons = true,
            hoverToolbar = true,

            onChange,
            onKeyDown: onKeyDownProp,
            placeholder,
            value,

            css,
        },
        ref,
    ) => {
        const { theme } = useTheme();

        const [editorValue, setEditorValue] = useState(
            markdownToSlate(value ?? ""),
        );

        const editor = useMemo(
            () =>
                withSyntax(withEmojis(withHistory(withReact(createEditor())))),
            [],
        );

        const formats = getActiveFormats(editor, editor.selection);

        useEffect(() => {
            editor.enableEmoticons = emoticons;
        }, [editor, emoticons]);

        useEffect(() => {
            setEditorValue(markdownToSlate(value ?? ""));
        }, [value]);

        const renderElement = useCallback(
            (props: RenderElementProps) => <Element {...props} />,
            [],
        );

        const renderLeaf = useCallback(
            (props: RenderLeafProps) => <Leaf {...props} />,
            [],
        );

        const decorate = useCallback(
            ([node, path]: [Node, number[]]): Range[] => {
                if (Text.isText(node))
                    return parseMarkdownToRanges(node.text, path);

                return parseSpoilerRanges([node, path]);
            },
            [],
        );

        const handleShiftEnter = (e: KeyboardEvent) => {
            const { selection } = editor;

            if (selection && Range.isCollapsed(selection)) {
                if (!e.defaultPrevented) e.preventDefault();
                editor.splitNodes({ always: true });
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
                onKeyDownProp?.(e, editor);
            },
            [editor, formats, onKeyDownProp],
        );

        const handleChange = useCallback(
            (newValue: Descendant[]) => {
                if (onChange) {
                    const markdown = slateToMarkdown(newValue);
                    onChange(markdown, editor);
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
                        ref={ref}
                        autoFocus={autoFocus}
                        decorate={decorate}
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        onKeyDown={onKeyDown}
                        placeholder={placeholder}
                        renderPlaceholder={({
                            children,
                            attributes: { style, ref, ...attributes },
                        }) => (
                            <Typography
                                ref={ref ? (ref as any) : undefined}
                                {...attributes}
                                lineHeight={1}
                                position="absolute"
                                top={2.75}
                                left={2}
                                textColor="muted"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                css={{
                                    pointerEvents: "none",
                                    userSelect: "none",
                                    opacity: 0.75,
                                    verticalAlign: "middle",
                                }}
                            >
                                {children}
                            </Typography>
                        )}
                        css={{
                            display: "block",
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            padding: "0.5em",
                            minWidth: 0,
                            boxSizing: "border-box",
                            overflowX: "auto",
                            ...resolveResponsiveMerge(
                                theme,
                                { color, textColor, variant },
                                ({ color: c, textColor: tc, variant: v }) => ({
                                    ...resolveMarkdownStyles(theme, c, tc)[v],
                                }),
                            ),
                            ...(disabled && {
                                opacity: 0.5,
                                pointerEvents: "none",
                                cursor: "not-allowed",
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
    },
);

MarkdownInput.displayName = "MarkdownInput";

export { MarkdownInput };
