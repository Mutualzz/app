import {
  resolveCodeLanguage,
  tokenizeCodeSync,
  type CodeThemeType
} from "@utils/loadHighlighter";
import type { BundledLanguage } from "shiki";
import {
  type Descendant,
  Element as SlateElement,
  Node,
  type Range,
  Text
} from "slate";

const FENCE_PATTERN = /^\s*```\s*([\w+#.-]*)\s*$/;

export type InputCodeLineKind = "fenceOpen" | "fenceClose" | "code";

interface InputCodeBlock {
  openLine: number;
  closeLine: number | null;
  language: string;
}

interface InputCodeBlocks {
  blocks: InputCodeBlock[];
  lineKinds: Map<number, InputCodeLineKind>;
}

type CodeDecoratedRange = Range & {
  isMarker?: boolean;
  codeBlock?: boolean;
  codeColor?: string;
};

const codeBlockCache = new WeakMap<Descendant[], InputCodeBlocks>();

export const getInputCodeBlocks = (children: Descendant[]): InputCodeBlocks => {
  const cached = codeBlockCache.get(children);
  if (cached) return cached;

  const blocks: InputCodeBlock[] = [];
  const lineKinds = new Map<number, InputCodeLineKind>();
  let openBlock: { line: number; language: string } | null = null;

  children.forEach((child, lineIndex) => {
    const fence = FENCE_PATTERN.exec(Node.string(child));

    if (openBlock) {
      if (fence && fence[1] === "") {
        blocks.push({
          openLine: openBlock.line,
          closeLine: lineIndex,
          language: openBlock.language
        });
        lineKinds.set(lineIndex, "fenceClose");
        openBlock = null;
      } else {
        lineKinds.set(lineIndex, "code");
      }
      return;
    }

    if (fence) {
      openBlock = { line: lineIndex, language: fence[1] };
      lineKinds.set(lineIndex, "fenceOpen");
    }
  });

  if (openBlock) {
    const unclosedBlock: { line: number; language: string } = openBlock;
    blocks.push({
      openLine: unclosedBlock.line,
      closeLine: null,
      language: unclosedBlock.language
    });
  }

  const result = { blocks, lineKinds };
  codeBlockCache.set(children, result);
  return result;
};

export const isLineInsideCodeBlock = (
  children: Descendant[],
  lineIndex: number | undefined
) => {
  if (lineIndex === undefined) return false;
  const kind = getInputCodeBlocks(children).lineKinds.get(lineIndex);
  return kind === "fenceOpen" || kind === "code";
};

const wholeLineRanges = (
  children: Descendant[],
  lineIndex: number,
  extra: Omit<CodeDecoratedRange, "anchor" | "focus">
): CodeDecoratedRange[] => {
  const line = children[lineIndex];
  if (!line) return [];

  return Array.from(Node.texts(line)).map(([textNode, relativePath]) => {
    const path = [lineIndex, ...relativePath];
    return {
      ...extra,
      anchor: { path, offset: 0 },
      focus: { path, offset: textNode.text.length }
    };
  });
};

export const getCodeBlockRanges = (
  children: Descendant[],
  themeType: CodeThemeType,
  onLanguageMissing: (language: BundledLanguage) => void
): CodeDecoratedRange[] => {
  const { blocks } = getInputCodeBlocks(children);
  const ranges: CodeDecoratedRange[] = [];

  for (const block of blocks) {
    ranges.push(
      ...wholeLineRanges(children, block.openLine, {
        isMarker: true,
        codeBlock: true
      })
    );
    if (block.closeLine !== null) {
      ranges.push(
        ...wholeLineRanges(children, block.closeLine, {
          isMarker: true,
          codeBlock: true
        })
      );
    }

    const lastCodeLine = block.closeLine ?? children.length;
    const codeLineIndexes: number[] = [];
    for (
      let lineIndex = block.openLine + 1;
      lineIndex < lastCodeLine;
      lineIndex++
    ) {
      codeLineIndexes.push(lineIndex);
      ranges.push(...wholeLineRanges(children, lineIndex, { codeBlock: true }));
    }

    const language = resolveCodeLanguage(block.language);
    if (!language || codeLineIndexes.length === 0) continue;

    const codeText = codeLineIndexes
      .map((lineIndex) => Node.string(children[lineIndex]))
      .join("\n");
    const tokens = tokenizeCodeSync(codeText, language, themeType);
    if (!tokens) {
      onLanguageMissing(language);
      continue;
    }

    codeLineIndexes.forEach((lineIndex, tokenLineIndex) => {
      const line = children[lineIndex];
      if (
        !SlateElement.isElement(line) ||
        line.children.length !== 1 ||
        !Text.isText(line.children[0])
      ) {
        return;
      }

      const path = [lineIndex, 0];
      let offset = 0;
      for (const token of tokens[tokenLineIndex] ?? []) {
        const end = offset + token.content.length;
        if (token.color) {
          ranges.push({
            codeColor: token.color,
            anchor: { path, offset },
            focus: { path, offset: end }
          });
        }
        offset = end;
      }
    });
  }

  return ranges;
};
