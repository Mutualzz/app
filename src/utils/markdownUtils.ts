import { Element, Range, type Editor, type Selection } from "slate";

export const isBlockActive = (editor: Editor, block: string) => {
    const [match] = editor.nodes({
        match: (n) => Element.isElement(n) && n.type === block,
    });

    return !!match;
};

export const toggleBlockquote = (editor: Editor) => {
    const isActive = isBlockActive(editor, "blockquote");
    editor.setNodes(
        { type: isActive ? "line" : "blockquote" },
        {
            match: (n) => Element.isElement(n) && editor.isBlock(n),
        },
    );
};

export const getActiveFormats = (
    editor: Editor,
    selection: Selection,
): string[] => {
    if (!selection || Range.isCollapsed(selection)) return [];

    // 1. Get block node (assumes single block selection)
    const [blockEntry] = editor.nodes({
        at: selection,
        match: (n) => Element.isElement(n) && editor.isBlock(n),
    });
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!blockEntry) return [];

    const [, blockPath] = blockEntry;
    const blockText = editor.string(blockPath);

    // 2. Get absolute offsets of selection in block
    const pointOffset = (point: any) => {
        const range = { anchor: { ...point, offset: 0 }, focus: point };
        return editor.string(range).length;
    };
    const [start, end] = Range.edges(selection);
    const selStart = pointOffset(start);
    const selEnd = pointOffset(end);

    // 3. Find all marker locations
    const MARKERS: { marker: string; type: string }[] = [
        { marker: "**", type: "bold" },
        { marker: "*", type: "italic" },
        { marker: "__", type: "underline" },
        { marker: "~~", type: "strikethrough" },
        { marker: "`", type: "code" },
        { marker: "||", type: "spoiler" },
    ];
    const markers: { pos: number; marker: string; type: string }[] = [];
    for (const { marker, type } of MARKERS) {
        let idx = 0;
        while ((idx = blockText.indexOf(marker, idx)) !== -1) {
            markers.push({ pos: idx, marker, type });
            idx += marker.length;
        }
    }
    markers.sort((a, b) => a.pos - b.pos);

    // 4. Build a stack of active formats at each position
    const stack: { marker: string; type: string }[] = [];
    const activeAt: Set<string>[] = Array(blockText.length + 1)
        .fill(null)
        .map(() => new Set());
    let m = 0;
    for (let i = 0; i <= blockText.length; ++i) {
        // Toggle marker at this position
        while (m < markers.length && markers[m].pos === i) {
            const top = stack[stack.length - 1];
            if (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                top &&
                top.marker === markers[m].marker &&
                top.type === markers[m].type
            ) {
                stack.pop();
            } else {
                stack.push(markers[m]);
            }
            m++;
        }
        for (const fmt of stack) activeAt[i].add(fmt.marker);
    }

    const formatsInSelection = new Set<string>();
    for (let i = selStart; i < selEnd; ++i) {
        for (const type of activeAt[i] || []) {
            formatsInSelection.add(type);
        }
    }

    return [...formatsInSelection];
};
