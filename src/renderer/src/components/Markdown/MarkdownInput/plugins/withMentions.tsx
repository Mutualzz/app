import { Editor, Element, Path, Range, TextUnit } from "slate";
import { MentionType } from "@mutualzz/types";

export const withMentions = (editor: Editor) => {
  const { isInline, isVoid, markableVoid, deleteBackward } = editor;

  editor.isInline = (element: Element) =>
    element.type === "mention" ? true : isInline(element);

  editor.isVoid = (element: Element) =>
    element.type === "mention" ? true : isVoid(element);

  editor.markableVoid = (element: Element) =>
    element.type === "mention" || markableVoid(element);

  editor.isSelectable = (element: Element) => element.type !== "mention";

  editor.deleteBackward = (unit: TextUnit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection) && unit === "character") {
      const { path, offset } = selection.anchor;
      const lastIndex = path[path.length - 1];

      if (offset === 0 && lastIndex > 0) {
        const prevPath = Path.previous(path);
        const [prevNode] = editor.node(prevPath);

        if (Element.isElement(prevNode) && prevNode.type === "mention") {
          editor.removeNodes({ at: prevPath });
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  return editor;
};

export function insertMention(
  editor: Editor,
  mentionType: MentionType,
  id: string
) {
  editor.insertNodes({
    type: "mention",
    mentionType,
    id,
    children: [{ text: "" }]
  });
  editor.move({ unit: "offset" });
}
