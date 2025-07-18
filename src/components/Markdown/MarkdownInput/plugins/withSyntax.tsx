import { type Editor, Element, Point, Range, type TextUnit } from "slate";

type HeadingLevel = 1 | 2 | 3;

export const withSyntax = (editor: Editor) => {
    const { insertText, deleteBackward } = editor;

    editor.insertText = (text: string) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const blockEntry = editor.above({
                match: (n) => Element.isElement(n) && editor.isBlock(n),
            });

            if (blockEntry) {
                const [blockNode, blockPath] = blockEntry;
                const start = editor.start(blockPath);
                const range = { anchor: start, focus: selection.anchor };
                const beforeText = editor.string(range) + text;

                if (/^>\s/.test(beforeText)) {
                    editor.delete({ at: range });

                    editor.setNodes(
                        { type: "blockquote" },
                        {
                            match: (n) =>
                                Element.isElement(n) && editor.isBlock(n),
                        },
                    );

                    return;
                }

                const headingMatch = /^(#{1,3})(\s|$)/.exec(beforeText);

                if (headingMatch && headingMatch[2] === " ") {
                    const level = headingMatch[1].length;
                    if (
                        Element.isElement(blockNode) &&
                        blockNode.type === "heading"
                    ) {
                        if (blockNode.level !== level) {
                            editor.setNodes(
                                { level: level as HeadingLevel },
                                {
                                    match: (n) =>
                                        Element.isElement(n) &&
                                        n.type === "heading",
                                },
                            );
                        } else {
                            editor.setNodes(
                                {
                                    type: "heading",
                                    level: level as HeadingLevel,
                                },
                                {
                                    match: (n) =>
                                        Element.isElement(n) &&
                                        editor.isBlock(n),
                                },
                            );
                        }
                    } else {
                        editor.setNodes(
                            { type: "heading", level: level as HeadingLevel },
                            {
                                match: (n) =>
                                    Element.isElement(n) && editor.isBlock(n),
                            },
                        );
                    }
                }
            }
        }

        insertText(text);
    };

    editor.deleteBackward = (unit: TextUnit) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const blockEntry = editor.above({
                match: (n) => Element.isElement(n) && editor.isBlock(n),
            });

            if (blockEntry) {
                const [blockNode, blockPath] = blockEntry;
                const start = editor.start(blockPath);

                if (Point.equals(selection.anchor, start)) {
                    if (
                        Element.isElement(blockNode) &&
                        blockNode.type === "blockquote"
                    ) {
                        editor.setNodes({ type: "line" }, { at: blockPath });
                        return;
                    }
                }

                if (
                    Element.isElement(blockNode) &&
                    blockNode.type === "heading"
                ) {
                    const currentText = editor.string(blockPath);
                    const cursorOffset = selection.anchor.offset;

                    if (
                        cursorOffset > 0 &&
                        currentText[cursorOffset - 1] === "#"
                    ) {
                        const hashtagMatch = /^(#{1,3})/.exec(currentText);

                        if (hashtagMatch) {
                            const currentHashtagCount = hashtagMatch[1].length;

                            // Check if we're deleting the last hashtag in the sequence
                            const hashtagsBeforeCursor = currentText.substring(
                                0,
                                cursorOffset,
                            );
                            const consecutiveHashtags = /^(#{1,3})$/.exec(
                                hashtagsBeforeCursor,
                            );

                            if (
                                consecutiveHashtags &&
                                consecutiveHashtags[1].length ===
                                    currentHashtagCount
                            ) {
                                if (currentHashtagCount > 1) {
                                    editor.setNodes(
                                        {
                                            level: (currentHashtagCount -
                                                1) as HeadingLevel,
                                        },
                                        { at: blockPath },
                                    );
                                } else {
                                    editor.setNodes(
                                        { type: "line" },
                                        { at: blockPath },
                                    );
                                }

                                deleteBackward(unit);
                                return;
                            }
                        }
                    }
                }
            }
        }
        deleteBackward(unit);
    };

    return editor;
};
