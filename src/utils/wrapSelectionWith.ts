import { Range, type Editor } from "slate";

export function wrapSelectionWith(
    editor: Editor,
    wrapper: string,
    activeWrappers: string[],
) {
    const { selection } = editor;
    if (!selection || Range.isCollapsed(selection)) return;
    const [start, end] = Range.edges(selection);

    const blockPath = start.path;
    const blockText = editor.string(blockPath);

    const selStart = start.offset;
    const selEnd = end.offset;

    let left = selStart;
    let right = selEnd;

    for (const w of activeWrappers) {
        left -= w.length;
        right += w.length;
    }

    // Strip all wrappers to get the true core text
    let coreText = blockText.slice(left, right);
    for (const w of activeWrappers) {
        coreText = coreText.slice(w.length, coreText.length - w.length);
    }

    // Decide new wrappers (Discord: last clicked always outermost)
    let newWrappers: string[];
    if (activeWrappers.includes(wrapper)) {
        // Remove only if it's outermost!
        newWrappers = activeWrappers.filter((w) => w !== wrapper);
    } else {
        newWrappers = [...activeWrappers.filter((w) => w !== wrapper), wrapper];
    }

    // Wrap core text with new wrappers, OUTERMOST first
    let wrapped = coreText;
    for (let i = newWrappers.length - 1; i >= 0; i--) {
        wrapped = newWrappers[i] + wrapped + newWrappers[i];
    }

    // Replace expanded selection with new text
    editor.delete({
        at: {
            anchor: { path: blockPath, offset: left },
            focus: { path: blockPath, offset: right },
        },
    });

    editor.insertText(wrapped, { at: { path: blockPath, offset: left } });

    // Selection is always just inside all the wrappers
    const outerLen = newWrappers.reduce((sum, w) => sum + w.length, 0);
    editor.select({
        anchor: { path: blockPath, offset: left + outerLen },
        focus: { path: blockPath, offset: left + outerLen + coreText.length },
    });
}
