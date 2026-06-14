import { type Editor, Element, Range, type Selection } from "slate";

export const isBlockActive = (editor: Editor, block: string) => {
  const [match] = editor.nodes({
    match: (n) => Element.isElement(n) && n.type === block
  });

  return !!match;
};

export const toggleBlockquote = (editor: Editor) => {
  const isActive = isBlockActive(editor, "blockquote");
  editor.setNodes(
    { type: isActive ? "line" : "blockquote" },
    {
      match: (n) => Element.isElement(n) && editor.isBlock(n)
    }
  );
};

export const getActiveFormats = (
  editor: Editor,
  selection: Selection
): string[] => {
  if (!selection || Range.isCollapsed(selection)) return [];

  const [blockEntry] = editor.nodes({
    at: selection,
    match: (n) => Element.isElement(n) && editor.isBlock(n)
  });

  if (!blockEntry) return [];

  const [, blockPath] = blockEntry;
  const blockText = editor.string(blockPath);

  const pointOffset = (point: any) => {
    const range = { anchor: { ...point, offset: 0 }, focus: point };
    return editor.string(range).length;
  };
  const [start, end] = Range.edges(selection);
  const selStart = pointOffset(start);
  const selEnd = pointOffset(end);

  const MARKERS = [
    { marker: "**", type: "bold" },
    { marker: "__", type: "underline" },
    { marker: "~~", type: "strikethrough" },
    { marker: "||", type: "spoiler" },
    { marker: "*", type: "italic" },
    { marker: "`", type: "code" },
    { marker: "_", type: "italic" }
  ] as const;

  type MarkerType = (typeof MARKERS)[number]["type"];

  const stacks: Record<MarkerType, number[]> = {
    bold: [],
    underline: [],
    strikethrough: [],
    spoiler: [],
    italic: [],
    code: []
  };
  const activeAt: Set<string>[] = Array.from(
    { length: blockText.length + 1 },
    () => new Set<string>()
  );

  let i = 0;
  while (i < blockText.length) {
    const hit = MARKERS.find(({ marker }) => blockText.startsWith(marker, i));
    if (hit) {
      const { marker, type } = hit;
      const stack = stacks[type];
      if (stack.length > 0) {
        const openPos = stack.pop()!;
        const contentStart = openPos + marker.length;
        const contentEnd = i;
        if (contentEnd > contentStart) {
          for (let j = contentStart; j < contentEnd; j++) {
            activeAt[j].add(type);
          }
        }
      } else {
        stack.push(i);
      }
      i += marker.length;
    } else {
      i++;
    }
  }

  const formatsInSelection = new Set<string>();
  for (let i = selStart; i < selEnd; i++) {
    for (const type of activeAt[i]) {
      formatsInSelection.add(type);
    }
  }

  return [...formatsInSelection];
};
