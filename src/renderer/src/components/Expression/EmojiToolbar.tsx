import { ReactEditor, useSlate } from "slate-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MarkdownInputContext } from "@components/Markdown/MarkdownInput/MarkdownInput.context";
import {
  defaultEmojis,
  insertCustomEmoji,
  insertEmoji,
  useShortcodeQuery
} from "@utils/emojis/emojis";
import type { Emoji } from "emojibase";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Expression } from "@stores/objects/Expression";
import { useAppStore } from "@hooks/useStores";
import { ExpressionType } from "@mutualzz/types";
import { canUseCustomEmoji } from "@utils/index";
import { TWEMOJI_URL } from "@utils/urls";
import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { useTranslation } from "react-i18next";

interface StandardSuggestion {
  kind: "standard";
  key: string;
  shortcode: string;
  label: string;
  url: string;
  emoji: Emoji;
}

interface CustomSuggestion {
  kind: "custom";
  key: string;
  shortcode: string;
  label: string;
  url: string;
  expression: Expression;
}

type Suggestion = StandardSuggestion | CustomSuggestion;

const MIN_QUERY_LENGTH = 2;
const MAX_CUSTOM = 7;
const MAX_STANDARD = 7;
const MAX_TOTAL = 10;

function buildDeduplicatedLabels(
  expressions: Expression[]
): Map<Expression, string> {
  const counts = new Map<string, number>();
  for (const exp of expressions) {
    const key = exp.name.trim().toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const seen = new Map<string, number>();
  const labels = new Map<Expression, string>();

  for (const exp of expressions) {
    const key = exp.name.trim().toLowerCase();
    const total = counts.get(key) ?? 0;

    if (total === 1) {
      labels.set(exp, exp.name);
    } else {
      const index = seen.get(key) ?? 0;
      seen.set(key, index + 1);
      labels.set(exp, index === 0 ? exp.name : `${exp.name}_${index}`);
    }
  }

  return labels;
}

export const EmojiToolbar = () => {
  const editor = useSlate();
  const { enableEmojis } = useContext(MarkdownInputContext);
  const { t } = useTranslation("chat");
  const app = useAppStore();
  const { theme } = useTheme();

  const ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [visible, setVisible] = useState(false);
  const [toolbarStyle, setToolbarStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const { query, range } = useShortcodeQuery(editor);

  useEffect(() => {
    if (!enableEmojis || !query || query.length < MIN_QUERY_LENGTH) {
      setVisible(false);
      setSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();

    const channel = app.channels.active;
    const me = channel?.spaceId
      ? app.spaces.get(channel.spaceId)?.members.me
      : null;

    const allCustomEmojis = app.expressions.all.filter(
      (exp) =>
        exp.type === ExpressionType.Emoji &&
        canUseCustomEmoji(app.account?.id || "", exp, me, channel)
    );

    const deduplicatedLabels = buildDeduplicatedLabels(allCustomEmojis);

    const customResults: CustomSuggestion[] = [];
    const seenIds = new Set<string>();

    for (const exp of allCustomEmojis) {
      if (customResults.length >= MAX_CUSTOM) break;
      if (seenIds.has(exp.id)) continue;

      const displayName = deduplicatedLabels.get(exp) ?? exp.name;
      const matchesQuery =
        exp.name.toLowerCase().includes(lowerQuery) ||
        displayName.toLowerCase().includes(lowerQuery);

      if (!matchesQuery) continue;

      seenIds.add(exp.id);
      customResults.push({
        kind: "custom",
        key: `custom-${exp.id}`,
        shortcode: exp.name,
        label: `:${displayName}:`,
        url: exp.url,
        expression: exp
      });
    }

    // Default emojis
    const standardResults: StandardSuggestion[] = [];
    for (const em of defaultEmojis) {
      if (standardResults.length >= MAX_STANDARD) break;
      const match = em.shortcodes?.find((sh) => sh.includes(lowerQuery));
      if (!match) continue;

      standardResults.push({
        kind: "standard",
        key: `standard-${em.hexcode}-${match}`,
        shortcode: match,
        label: `:${match}:`,
        url: `${TWEMOJI_URL}/${em.hexcode.toLowerCase()}.svg`,
        emoji: em
      });
    }

    // Exact-prefix matches first for standard results
    standardResults.sort(
      (a, b) =>
        (a.shortcode.startsWith(lowerQuery) ? 0 : 1) -
        (b.shortcode.startsWith(lowerQuery) ? 0 : 1)
    );

    const merged: Suggestion[] = [...customResults, ...standardResults].slice(
      0,
      MAX_TOTAL
    );

    if (merged.length === 0) {
      setVisible(false);
      return;
    }

    setSuggestions(merged);
    setActiveIndex(0);
    setVisible(true);
  }, [query, enableEmojis, app.account?.id]);

  useEffect(() => {
    if (!visible) return;

    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const caretRect = sel.getRangeAt(0).getBoundingClientRect();
      if (!caretRect.width && !caretRect.height) return;

      const editorEl = ReactEditor.toDOMNode(editor, editor);
      const editorRect = editorEl.getBoundingClientRect();

      const popupHeight = ref.current?.offsetHeight ?? 260;
      const spaceAbove = caretRect.top;
      const spaceBelow = window.innerHeight - caretRect.bottom;
      const showAbove =
        spaceAbove >= popupHeight + 12 || spaceAbove > spaceBelow;

      setToolbarStyle({
        top: showAbove
          ? caretRect.top - popupHeight - 24
          : caretRect.bottom + 24,
        left: editorRect.left,
        width: editorRect.width
      });
    } catch {}
  }, [visible, suggestions]);

  const select = useCallback(
    (suggestion: Suggestion) => {
      if (!range) return;

      editor.select(range);
      editor.delete();

      if (suggestion.kind === "standard")
        insertEmoji(editor, suggestion.emoji, true);
      else insertCustomEmoji(editor, suggestion.expression, true);

      setVisible(false);
    },
    [editor, range]
  );

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => (i + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(
            (i) => (i - 1 + suggestions.length) % suggestions.length
          );
          break;
        case "Enter":
        case "Tab": {
          e.stopPropagation();
          const s = suggestions[activeIndex];
          if (s) {
            e.preventDefault();
            select(s);
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          setVisible(false);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [visible, suggestions, activeIndex, select]);

  useEffect(() => {
    ref.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    if (!visible) return;

    const onPointerDown = (e: PointerEvent) => {
      const toolbarEl = ref.current;
      const target = e.target as Node | null;
      if (!toolbarEl || !target) return;

      if (!toolbarEl.contains(target)) setVisible(false);
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [visible]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 1 : 5}
      ref={ref}
      onMouseDown={(e) => e.preventDefault()}
      css={{
        position: "fixed",
        top: toolbarStyle?.top ?? -9999,
        left: toolbarStyle?.left ?? 0,
        width: toolbarStyle?.width ?? 0
      }}
      zIndex={theme.zIndex.tooltip}
      visibility={toolbarStyle ? "visible" : "hidden"}
      maxHeight={260}
      overflowY="auto"
      borderRadius={8}
      px={2}
      direction="column"
    >
      <Stack ml={2} alignItems="center" my={2} spacing={1.25}>
        <Typography level="body-sm" letterSpacing="0.06em" fontWeight={200}>
          {t("expressionPreview.emojiMatching")}
        </Typography>
        <Typography level="body-sm" letterSpacing="0.06em" fontWeight={200}>
          :{query}:
        </Typography>
      </Stack>
      <Stack direction="column">
        {suggestions.map((suggestion, index) => (
          <Paper
            key={suggestion.key}
            direction="row"
            alignItems="center"
            data-index={index}
            justifyContent="space-between"
            p={2}
            borderRadius={4}
            elevation={suggestion.key === suggestions[activeIndex].key ? 3 : 0}
            variant={
              suggestion.key === suggestions[activeIndex].key
                ? "elevation"
                : "plain"
            }
            css={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)"
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              select(suggestion);
            }}
          >
            <Stack alignItems="center">
              <img
                src={suggestion.url}
                alt={suggestion.label}
                width={24}
                height={24}
                css={{
                  borderRadius: 4,
                  marginRight: 12,
                  objectFit: "cover"
                }}
              />
              <Typography>{suggestion.label}</Typography>
            </Stack>
            {suggestion.kind === "custom" && (
              <>
                {suggestion.expression.space && (
                  <Stack spacing={1.25} alignItems="center">
                    <SpaceIcon space={suggestion.expression.space} size={16} />
                    <Typography level="body-sm" textColor="secondary">
                      {suggestion.expression.space.name}
                    </Typography>
                  </Stack>
                )}
                {suggestion.expression.author &&
                  !suggestion.expression.space && (
                    <Stack spacing={1.25} alignItems="center">
                      <UserAvatar
                        user={suggestion.expression.author}
                        size={16}
                      />
                      <Typography level="body-sm" textColor="secondary">
                        {suggestion.expression.author.displayName}
                      </Typography>
                    </Stack>
                  )}
              </>
            )}
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
};
