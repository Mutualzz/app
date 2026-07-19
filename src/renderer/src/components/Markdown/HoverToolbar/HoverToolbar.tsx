import { MarkdownInputContext } from "@components/Markdown/MarkdownInput/MarkdownInput.context";
import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { useAppStore } from "@hooks/useStores";
import {
  Box,
  ButtonGroup,
  Divider,
  InputColor,
  Popover,
  Portal,
  Stack,
  useTheme
} from "@mutualzz/ui-web";
import type { ColorLike } from "@mutualzz/ui-core";
import { MARKDOWN_COLOR_PRESETS } from "@mutualzz/validators";
import { isBlockActive, toggleBlockquote } from "@utils/markdownUtils";
import { wrapSelectionWith } from "@utils/wrapSelectionWith";
import { wrapSelectionWithColor } from "@utils/wrapSelectionWithColor";
import {
  CodeIcon,
  EyeIcon,
  EyeSlashIcon,
  PaletteIcon,
  QuotesIcon,
  TextBIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon
} from "@phosphor-icons/react";
import {
  type MouseEvent as ReactMouseEvent,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import { Range } from "slate";
import { ReactEditor, useFocused, useSlate } from "slate-react";

const PRESET_ENTRIES = Object.entries(MARKDOWN_COLOR_PRESETS);

export const HoverToolbar = () => {
  const { t } = useTranslation("common");
  const { theme } = useTheme();
  const app = useAppStore();
  const { activeFormats, enableHoverToolbar } =
    useContext(MarkdownInputContext);
  const ref = useRef<HTMLDivElement>(null);
  const lastRectRef = useRef<DOMRect | null>(null);
  const editor = useSlate();
  const inFocus = useFocused();

  const [visible, setVisible] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [customColor, setCustomColor] = useState("#ed4245");

  const keepOpen = interacting || colorOpen;

  useEffect(() => {
    if (!enableHoverToolbar) return;
    const el = ref.current;
    if (!el) return;

    const { selection } = editor;
    const hasSelection =
      !!selection && !Range.isCollapsed(selection) && !!editor.selection;

    if ((!hasSelection || !inFocus) && !keepOpen) {
      setVisible(false);
      setColorOpen(false);
      return;
    }

    let rect = lastRectRef.current;

    if (hasSelection) {
      try {
        const domRange = ReactEditor.toDOMRange(editor, selection!);
        rect = domRange.getBoundingClientRect();
        lastRectRef.current = rect;
      } catch {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          rect = domSelection.getRangeAt(0).getBoundingClientRect();
          lastRectRef.current = rect;
        }
      }
    }

    if (!rect) {
      if (!keepOpen) setVisible(false);
      return;
    }

    const top = rect.top + window.scrollY - el.offsetHeight - 16;
    const left =
      rect.left + window.scrollX + rect.width / 2 - el.offsetWidth / 2;

    el.style.top = `${top}px`;
    el.style.left = `${left}px`;

    setVisible(true);
  }, [
    editor,
    editor.selection,
    inFocus,
    enableHoverToolbar,
    keepOpen,
    colorOpen
  ]);

  useEffect(() => {
    if (!inFocus && !keepOpen) {
      setVisible(false);
      setColorOpen(false);
    }
  }, [inFocus, keepOpen]);

  useEffect(() => {
    if (!colorOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (ref.current?.contains(target)) return;

      const appRoot = document.getElementById("app");
      let node: Node | null = target;
      while (node && node !== document.body) {
        if (node.parentNode === document.body && node !== appRoot) {
          return;
        }
        node = node.parentNode;
      }

      setColorOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [colorOpen]);

  const textFormat = (e: ReactMouseEvent<HTMLButtonElement>, syntax: string) => {
    e.preventDefault();
    wrapSelectionWith(editor, syntax, activeFormats);
  };

  const applyColor = (color: string, keepPopoverOpen = false) => {
    wrapSelectionWithColor(editor, color);
    if (!keepPopoverOpen) setColorOpen(false);
    try {
      ReactEditor.focus(editor);
    } catch {}
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
        onPointerEnter={() => setInteracting(true)}
        onPointerLeave={() => setInteracting(false)}
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
        <Stack direction="row" alignItems="center">
          <ButtonGroup spacing={1} variant="plain">
            <Button
              shape="rounded"
              title={t("markdown.bold")}
              color={activeFormats.includes("**") ? "success" : undefined}
              onClick={(e) => textFormat(e, "**")}
            >
              <TextBIcon weight="bold" />
            </Button>
            <Button
              title={t("markdown.italic")}
              shape="rounded"
              color={activeFormats.includes("*") ? "success" : undefined}
              onClick={(e) => textFormat(e, "*")}
            >
              <TextItalicIcon weight="bold" />
            </Button>
            <Button
              title={t("markdown.underline")}
              shape="rounded"
              color={activeFormats.includes("__") ? "success" : undefined}
              onClick={(e) => textFormat(e, "__")}
            >
              <TextUnderlineIcon weight="bold" />
            </Button>
            <Button
              title={t("markdown.strikethrough")}
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
              title={t("markdown.blockquote")}
              color={
                isBlockActive(editor, "blockquote") ? "success" : undefined
              }
              shape="rounded"
              onClick={() => toggleBlockquote(editor)}
            >
              <QuotesIcon weight="bold" />
            </Button>
            <Button
              title={t("markdown.code")}
              color={activeFormats.includes("`") ? "success" : undefined}
              shape="rounded"
              onClick={(e) => textFormat(e, "`")}
            >
              <CodeIcon weight="bold" />
            </Button>
            <Button
              title={t("markdown.spoiler")}
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
            <Popover
              isOpen={colorOpen}
              closeOnClickOutside={false}
              closeOnInteract={false}
              placement="top"
              elevation={app.settings?.preferEmbossed ? 3 : 2}
              transparency={0}
              p={2}
              trigger={
                <Button
                  title={t("markdown.color")}
                  shape="rounded"
                  color={colorOpen ? "success" : undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setColorOpen((open) => !open);
                  }}
                >
                  <PaletteIcon weight="bold" />
                </Button>
              }
            >
              <Stack
                spacing={2}
                minWidth={200}
                onMouseDown={(e) => e.preventDefault()}
                onPointerEnter={() => setInteracting(true)}
                onPointerLeave={() => setInteracting(false)}
              >
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {PRESET_ENTRIES.map(([name, hex]) => (
                    <Box
                      key={name}
                      width={24}
                      height={24}
                      borderRadius={6}
                      css={{
                        backgroundColor: hex,
                        cursor: "pointer",
                        border: `1px solid ${theme.typography.colors.muted}44`
                      }}
                      title={name}
                      onClick={() => applyColor(name)}
                      onMouseDown={(e) => e.preventDefault()}
                    />
                  ))}
                </Stack>
                <InputColor
                  value={customColor as ColorLike}
                  allowGradient={false}
                  allowAlpha={false}
                  onChange={(value) => {
                    const next = String(value);
                    setCustomColor(next);
                    applyColor(next, true);
                  }}
                />
              </Stack>
            </Popover>
          </ButtonGroup>
        </Stack>
      </Paper>
    </Portal>
  );
};
