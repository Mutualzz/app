import { type Editor, Element, Point, Range, type TextUnit } from "slate";

type HeadingLevel = 1 | 2 | 3;

export const withShortcuts = (editor: Editor) => {
    const { insertText, deleteBackward, normalizeNode } = editor;

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

                if (headingMatch) {
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
            const blockquoteMatch = editor.above({
                match: (n) => Element.isElement(n) && n.type === "blockquote",
            });

            if (blockquoteMatch) {
                const [, path] = blockquoteMatch;
                const start = editor.start(path);

                if (Point.equals(selection.anchor, start)) {
                    editor.setNodes(
                        {
                            type: "line",
                        },
                        { at: path },
                    );

                    return;
                }
            }

            const headingMatch = editor.above({
                match: (n) => Element.isElement(n) && n.type === "heading",
            });

            if (headingMatch) {
                const [headingNode, path] = headingMatch;

                if (headingNode.level > 1) {
                    editor.setNodes(
                        { level: (headingNode.level - 1) as HeadingLevel },
                        { at: path },
                    );
                } else {
                    editor.setNodes({ type: "line" }, { at: path });
                }
            }
        }

        deleteBackward(unit);
    };

    editor.normalizeNode = ([node, path]) => {
        if (
            Element.isElement(node) &&
            editor.isBlock(node) &&
            node.type === "heading"
        ) {
            const text = editor.string(path);
            if (!text.startsWith("#")) {
                editor.withoutNormalizing(() => {
                    editor.setNodes({ type: "line" }, { at: path });
                });
                return;
            }
        }

        normalizeNode([node, path]);
    };

    return editor;
};
