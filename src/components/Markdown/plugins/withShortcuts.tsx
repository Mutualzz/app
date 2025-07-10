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

                const range: Range = {
                    anchor: selection.anchor,
                    focus: editor.start(blockPath),
                };

                const beforeText = editor.string(range) + text;

                if (/^>\s/.test(beforeText)) {
                    editor.select(range);
                    if (!Range.isCollapsed(range)) editor.delete();

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
                } else {
                    editor.setNodes(
                        { type: "line" },
                        {
                            match: (n) =>
                                Element.isElement(n) && editor.isBlock(n),
                        },
                    );
                }
            }
        }

        insertText(text);
    };

    editor.deleteBackward = (unit: TextUnit) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const match = editor.above({
                match: (n) => Element.isElement(n) && n.type === "blockquote",
            });

            if (match) {
                const [, path] = match;
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
