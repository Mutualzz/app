import { MarkdownInputContext } from "@components/Markdown/MarkdownInput/MarkdownInput.context";
import { Paper } from "@components/Paper";
import { ButtonGroup, Divider, Portal, useTheme } from "@mutualzz/ui-web";
import { isBlockActive, toggleBlockquote } from "@utils/markdownUtils";
import { wrapSelectionWith } from "@utils/wrapSelectionWith";
import {
  type MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { Range } from "slate";
import { useFocused, useSlate } from "slate-react";
import { useAppStore } from "@hooks/useStores";
import { Button } from "@components/Button";
import {
  CodeIcon,
  EyeIcon,
  EyeSlashIcon,
  QuotesIcon,
  TextBIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon
} from "@phosphor-icons/react";

export const HoverToolbar = () => {
  const { theme } = useTheme();
  const app = useAppStore();
  const { activeFormats, enableHoverToolbar } =
    useContext(MarkdownInputContext);
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  const inFocus = useFocused();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enableHoverToolbar) return;
    const el = ref.current;
    if (!el) return;

    const { selection } = editor;

    if (
      !selection ||
      !inFocus ||
      Range.isCollapsed(selection) ||
      !editor.selection
    ) {
      setVisible(false);
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      setVisible(false);
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    const top = rect.top + window.scrollY - el.offsetHeight - 16;
    const left =
      rect.left + window.scrollX + rect.width / 2 - el.offsetWidth / 2;

    el.style.top = `${top}px`;
    el.style.left = `${left}px`;

    setVisible(true);
  }, [editor.selection, inFocus, enableHoverToolbar]);

  useEffect(() => {
    if (!inFocus) setVisible(false);
  }, [inFocus]);

  const textFormat = (e: MouseEvent<HTMLButtonElement>, syntax: string) => {
    e.preventDefault();
    wrapSelectionWith(editor, syntax, activeFormats);
  };

  return (
    <Portal>
      <Paper
        elevation={app.settings?.preferEmbossed ? 3 : 2}
        transparency={0}
        ref={ref}
        borderRadius={12}
        p={1}
        onMouseDown={(e) => e.preventDefault()}
        css={{
          position: "absolute",
          top: visible ? undefined : "-9999px",
          left: visible ? undefined : "-9999px",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
          transition: "opacity 150ms ease-out, transform 150ms ease-out",
          zIndex: theme.zIndex.tooltip,
          boxShadow: theme.shadows[5],
          pointerEvents: visible ? "auto" : "none"
        }}
      >
        <ButtonGroup spacing={1} variant="plain">
          <Button
            shape="rounded"
            title="Bold"
            color={activeFormats.includes("**") ? "success" : undefined}
            onClick={(e) => textFormat(e, "**")}
          >
            <TextBIcon weight="bold" />
          </Button>
          <Button
            title="Italic"
            shape="rounded"
            color={activeFormats.includes("*") ? "success" : undefined}
            onClick={(e) => textFormat(e, "*")}
          >
            <TextItalicIcon weight="bold" />
          </Button>
          <Button
            title="Underline"
            shape="rounded"
            color={activeFormats.includes("__") ? "success" : undefined}
            onClick={(e) => textFormat(e, "__")}
          >
            <TextUnderlineIcon weight="bold" />
          </Button>
          <Button
            title="Strikethrough"
            shape="rounded"
            color={activeFormats.includes("~~") ? "success" : undefined}
            onClick={(e) => textFormat(e, "~~")}
          >
            <TextStrikethroughIcon weight="bold" />
          </Button>
        </ButtonGroup>
        <Divider
          orientation="vertical"
          lineColor="muted"
          css={{
            opacity: 0.25,
            marginInline: 4
          }}
        />
        <ButtonGroup spacing={1} variant="plain">
          <Button
            title="Blockquote"
            color={isBlockActive(editor, "blockquote") ? "success" : undefined}
            shape="rounded"
            onClick={() => toggleBlockquote(editor)}
          >
            <QuotesIcon weight="bold" />
          </Button>
          <Button
            title="Code"
            color={activeFormats.includes("`") ? "success" : undefined}
            shape="rounded"
            onClick={(e) => textFormat(e, "`")}
          >
            <CodeIcon weight="bold" />
          </Button>
          <Button
            title="Spoiler"
            color={activeFormats.includes("||") ? "success" : undefined}
            shape="rounded"
            onClick={(e) => textFormat(e, "||")}
          >
            {activeFormats.includes("||") ? (
              <EyeSlashIcon weight="bold" />
            ) : (
              <EyeIcon weight="bold" />
            )}
          </Button>
        </ButtonGroup>
      </Paper>
    </Portal>
  );
};
