import { resolveResponsiveMerge } from "@mutualzz/ui-core";
import { Typography, useTheme } from "@mutualzz/ui-web";
import { markdownToSlate } from "@utils/markdownToSlate";
import { getActiveFormats } from "@utils/markdownUtils";
import { slateToMarkdown } from "@utils/slateToMarkdown";
import { wrapSelectionWith } from "@utils/wrapSelectionWith";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  createEditor,
  type Descendant,
  type Editor as SlateEditor,
  Element as SlateElement,
  Node,
  Range,
  Text
} from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, type RenderElementProps, type RenderLeafProps, Slate, withReact } from "slate-react";
import { HoverToolbar } from "../HoverToolbar/HoverToolbar";
import { Element } from "./Element";
import { Leaf } from "./Leaf";
import { MarkdownInputContext } from "./MarkdownInput.context";
import { parseMarkdownToRanges, parseSpoilerRanges, resolveMarkdownStyles } from "./MarkdownInput.helpers";
import type { MarkdownInputProps } from "./MarkdownInput.types";
import { withEmojis } from "./plugins/withEmojis";
import { withSyntax } from "./plugins/withSyntax";
import { EmojiToolbar } from "@components/Expression/EmojiToolbar";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { insertMention, withMentions } from "@components/Markdown/MarkdownInput/plugins/withMentions";
import { MentionPicker } from "@components/MentionPicker";
import { ExpressionPickerTrigger } from "@components/Expression/ExpressionPickerTrigger";

export interface MarkdownInputHandle {
  focus: (opts?: { at?: "start" | "end" | "selectAll" }) => void;
  editor: SlateEditor;
  sendMessage: () => void;
}

const MarkdownInput = forwardRef<MarkdownInputHandle, MarkdownInputProps>(
  (
    {
      color = "neutral",
      textColor = "inherit",
      variant = "outlined",
      disabled = false,

      autoFocus = false,
      emoticons = true,
      hoverToolbar = true,
      emojiPicker = true,
      gifPicker = true,

      onChange,
      onKeyDown: onKeyDownProp,
      onSendMessage,
      placeholder,
      value,

      css
    },
    ref
  ) => {
    const { theme } = useTheme();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [editorValue, setEditorValue] = useState(
      markdownToSlate(value ?? "")
    );

    const editor = useMemo(
      () =>
        withSyntax(
          withEmojis(withMentions(withHistory(withReact(createEditor()))))
        ),
      []
    );

    const formats = getActiveFormats(editor, editor.selection);

    const [mentionSearch, setMentionSearch] = useState<string | null>(null);
    const [mentionAnchor, setMentionAnchor] = useState<DOMRect | null>(null);

    useImperativeHandle(ref, () => ({
      focus: (opts) => {
        const at = opts?.at ?? "end";
        ReactEditor.focus(editor);

        if (at === "selectAll") {
          const [, firstPath] = Node.first(editor, []);
          const [, lastPath] = Node.last(editor, []);
          editor.select({
            anchor: editor.start(firstPath),
            focus: editor.end(lastPath)
          });
          return;
        }

        const point = at === "start" ? editor.start([]) : editor.end([]);

        editor.select(point);
      },
      editor,
      sendMessage: () => onSendMessage?.()
    }));

    useEffect(() => {
      editor.enableEmoticons = emoticons;
    }, [editor, emoticons]);

    useEffect(() => {
      setEditorValue(markdownToSlate(value ?? ""));
    }, [value]);

    const renderElement = useCallback(
      (props: RenderElementProps) => <Element {...props} />,
      []
    );

    const renderLeaf = useCallback(
      (props: RenderLeafProps) => <Leaf {...props} />,
      []
    );

    const decorate = useCallback(([node, path]: [Node, number[]]): Range[] => {
      if (Text.isText(node)) return parseMarkdownToRanges(node.text, path);

      return parseSpoilerRanges([node, path]);
    }, []);

    const handleShiftEnter = (e: KeyboardEvent) => {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        if (!e.defaultPrevented) e.preventDefault();
        editor.splitNodes({ always: true });
      }
    };

    useHotkeys([
      {
        hotkey: "Mod+A",
        callback: () => {
          const [, firstPath] = Node.first(editor, []);
          const [, lastPath] = Node.last(editor, []);
          editor.select({
            anchor: editor.start(firstPath),
            focus: editor.end(lastPath)
          });
        },
        options: {
          preventDefault: true,
          target: inputRef
        }
      },
      {
        hotkey: "Mod+B",
        callback: () => {
          wrapSelectionWith(editor, "**", formats);
        },
        options: { preventDefault: true, target: inputRef }
      },
      {
        hotkey: "Mod+I",
        callback: () => {
          wrapSelectionWith(editor, "*", formats);
        },
        options: {
          preventDefault: true,
          target: inputRef
        }
      },
      {
        hotkey: "Mod+U",
        callback: () => {
          wrapSelectionWith(editor, "__", formats);
        },
        options: {
          preventDefault: true,
          target: inputRef
        }
      },
      {
        hotkey: "Mod+S",
        callback: () => {
          wrapSelectionWith(editor, "~~", formats);
        },
        options: {
          preventDefault: true,
          target: inputRef
        }
      },
      {
        hotkey: "Backspace",
        callback: (e) => {
          const { selection } = editor;

          if (selection && Range.isExpanded(selection)) {
            const blockEntry = editor.above({
              match: (n) => SlateElement.isElement(n) && editor.isBlock(n)
            });

            if (blockEntry) {
              const [blockNode, blockPath] = blockEntry;

              if (
                SlateElement.isElement(blockNode) &&
                (blockNode.type === "heading" ||
                  blockNode.type === "blockquote")
              ) {
                e.preventDefault();
                editor.delete();
                editor.setNodes({ type: "line" }, { at: blockPath });
                return;
              }
            }
          }
        }
      },
      {
        hotkey: "Shift+Enter",
        callback: (e) => {
          handleShiftEnter(e);
        }
      },
      {
        hotkey: "ArrowLeft",
        callback: (e) => {
          const { selection } = editor;

          if (selection && Range.isCollapsed(selection)) {
            e.preventDefault();
            editor.move({
              unit: "offset",
              reverse: true
            });
          }
        }
      },
      {
        hotkey: "ArrowRight",
        callback: (e) => {
          const { selection } = editor;

          if (selection && Range.isCollapsed(selection)) {
            e.preventDefault();
            editor.move({
              unit: "offset",
              reverse: false
            });
          }
        }
      }
    ]);

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        onKeyDownProp?.(e, editor);
      },
      [editor, onKeyDownProp]
    );

    const handleChange = useCallback(
      (newValue: Descendant[]) => {
        if (onChange) {
          const markdown = slateToMarkdown(newValue);
          onChange(markdown, editor);
        }

        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection);

          let beforeIndex = start.offset - 1;
          let textBefore = "";

          const [node] = editor.node(start.path);
          if (node && Text.isText(node)) {
            while (beforeIndex >= 0) {
              const char = node.text[beforeIndex];
              if (char === "@") {
                textBefore = node.text.substring(beforeIndex + 1, start.offset);
                break;
              }
              if (/[\s*_`~|]/.test(char)) break;
              beforeIndex--;
            }
          }

          if (
            beforeIndex >= 0 &&
            Text.isText(node) &&
            node.text[beforeIndex] === "@"
          ) {
            setMentionSearch(textBefore);
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
              setMentionAnchor(
                domSelection.getRangeAt(0).getBoundingClientRect()
              );
            }
          } else {
            setMentionSearch(null);
            setMentionAnchor(null);
          }
        }
      },
      [editor, onChange]
    );

    return (
      <MarkdownInputContext.Provider
        value={{
          activeFormats: formats,
          enableEmoticons: emoticons,
          enableHoverToolbar: hoverToolbar,
          enableEmojis: emojiPicker,
          onSendMessage
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
          <div
            css={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              ...resolveResponsiveMerge(
                theme,
                { color, textColor, variant },
                ({ color: c, textColor: tc, variant: v }) => ({
                  ...resolveMarkdownStyles(theme, c, tc)[v]
                })
              ),
              ...(disabled && {
                opacity: 0.5,
                pointerEvents: "none",
                cursor: "not-allowed"
              }),
              ...css
            }}
          >
            <HoverToolbar />
            <EmojiToolbar />
            <Editable
              ref={inputRef}
              autoFocus={autoFocus}
              decorate={decorate}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              onKeyDown={onKeyDown}
              placeholder={placeholder ?? ""}
              renderPlaceholder={({
                children,
                attributes: { style, ref, ...attributes }
              }) => (
                <Typography
                  ref={ref ? (ref as any) : undefined}
                  {...attributes}
                  lineHeight={1}
                  position="absolute"
                  top={2}
                  left={1}
                  textColor="muted"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  css={{
                    pointerEvents: "none",
                    userSelect: "none",
                    opacity: 0.75,
                    verticalAlign: "middle"
                  }}
                >
                  {children}
                </Typography>
              )}
              css={{
                display: "block",
                position: "relative",
                flex: 1,
                minWidth: 0,
                padding: "0.25em",
                boxSizing: "border-box",
                overflowX: "hidden",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                background: "transparent",
                border: "none",
                outline: "none",
                borderRadius: 0
              }}
              disabled={disabled}
              disableDefaultStyles
              spellCheck
            />

            {!disabled && (
              <ExpressionPickerTrigger
                emojiPicker={emojiPicker}
                gifPicker={gifPicker}
              />
            )}

            {mentionSearch !== null && mentionAnchor && (
              <MentionPicker
                search={mentionSearch}
                onSelect={(mentionType, userId) => {
                  const { selection } = editor;
                  if (selection) {
                    const start = editor.before(selection.anchor, {
                      unit: "character",
                      distance: mentionSearch.length + 1
                    });
                    if (start) {
                      editor.select({
                        anchor: start,
                        focus: selection.anchor
                      });
                      editor.delete();
                    }
                  }
                  insertMention(editor, mentionType, userId);
                  setMentionSearch(null);
                  setMentionAnchor(null);
                }}
                onClose={() => {
                  setMentionSearch(null);
                  setMentionAnchor(null);
                }}
              />
            )}
          </div>
        </Slate>
      </MarkdownInputContext.Provider>
    );
  }
);

MarkdownInput.displayName = "MarkdownInput";

export { MarkdownInput };
