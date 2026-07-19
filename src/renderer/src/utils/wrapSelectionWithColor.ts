import { resolveMarkdownTextColor } from "@mutualzz/validators";
import { Path, Range, type Editor } from "slate";

const COLOR_CLOSE = "[/color]";

export function wrapSelectionWithColor(editor: Editor, colorInput: string) {
  const { selection } = editor;
  if (!selection || Range.isCollapsed(selection)) return;

  const color = colorInput.trim();
  if (!resolveMarkdownTextColor(color)) return;

  const [start, end] = Range.edges(selection);
  if (!Path.equals(start.path, end.path)) return;

  const path = start.path;
  const text = editor.string(path);
  const selStart = start.offset;
  const selEnd = end.offset;
  const selected = text.slice(selStart, selEnd);

  const before = text.slice(0, selStart);
  const after = text.slice(selEnd);
  const openMatch = before.match(/\[color=([^\]]+)\]$/i);
  const closeMatch = after.startsWith(COLOR_CLOSE);

  if (openMatch && closeMatch) {
    const existing = openMatch[1];
    const openTag = openMatch[0];
    const sameColor =
      existing.toLowerCase() === color.toLowerCase() ||
      resolveMarkdownTextColor(existing) === resolveMarkdownTextColor(color);

    const withoutTags =
      text.slice(0, selStart - openTag.length) +
      selected +
      text.slice(selEnd + COLOR_CLOSE.length);

    if (sameColor) {
      editor.delete({
        at: {
          anchor: { path, offset: 0 },
          focus: { path, offset: text.length }
        }
      });
      editor.insertText(withoutTags, { at: { path, offset: 0 } });
      const nextStart = selStart - openTag.length;
      editor.select({
        anchor: { path, offset: nextStart },
        focus: { path, offset: nextStart + selected.length }
      });
      return;
    }

    const openTagNew = `[color=${color}]`;
    const replaced =
      text.slice(0, selStart - openTag.length) +
      openTagNew +
      selected +
      COLOR_CLOSE +
      text.slice(selEnd + COLOR_CLOSE.length);

    editor.delete({
      at: {
        anchor: { path, offset: 0 },
        focus: { path, offset: text.length }
      }
    });
    editor.insertText(replaced, { at: { path, offset: 0 } });
    const nextStart = selStart - openTag.length + openTagNew.length;
    editor.select({
      anchor: { path, offset: nextStart },
      focus: { path, offset: nextStart + selected.length }
    });
    return;
  }

  const openTag = `[color=${color}]`;
  const wrapped = `${openTag}${selected}${COLOR_CLOSE}`;

  editor.delete({
    at: {
      anchor: { path, offset: selStart },
      focus: { path, offset: selEnd }
    }
  });
  editor.insertText(wrapped, { at: { path, offset: selStart } });
  editor.select({
    anchor: { path, offset: selStart + openTag.length },
    focus: { path, offset: selStart + openTag.length + selected.length }
  });
}
