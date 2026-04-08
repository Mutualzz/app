import { useSlate } from "slate-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MarkdownInputContext } from "@components/Markdown/MarkdownInput/MarkdownInput.context.ts";
import { defaultEmojis, insertCustomEmoji, insertEmoji, useShortcodeQuery, } from "@utils/emojis.ts";
import type { Emoji } from "emojibase";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Expression } from "@stores/objects/Expression.ts";
import { useAppStore } from "@hooks/useStores.ts";
import { ExpressionType } from "@mutualzz/types";
import { canUseCustomEmoji } from "@utils/index.ts";
import { TWEMOJI_URL } from "@utils/urls.ts";
import { Paper } from "@components/Paper.tsx";

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

export const EmojiToolbar = () => {
    const editor = useSlate();
    const { enableEmojis } = useContext(MarkdownInputContext);
    const app = useAppStore();
    const { theme } = useTheme();

    const ref = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(
        null,
    );

    const { query, range } = useShortcodeQuery(editor);

    useEffect(() => {
        if (!enableEmojis || !query || query.length < MIN_QUERY_LENGTH) {
            setVisible(false);
            setSuggestions([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const me = app.account?.id;

        const customResults: CustomSuggestion[] = [];
        const seenIds = new Set<string>();

        // Custom Emojis
        for (const exp of app.expressions.all) {
            if (customResults.length >= MAX_CUSTOM) break;
            if (exp.type !== ExpressionType.Emoji) continue;
            if (seenIds.has(exp.id)) continue;
            if (!canUseCustomEmoji(exp, me)) continue;
            if (!exp.name.toLowerCase().includes(lowerQuery)) continue;

            seenIds.add(exp.id);
            customResults.push({
                kind: "custom",
                key: `custom-${exp.id}`,
                shortcode: exp.name,
                label: `:${exp.name}:`,
                url: exp.url,
                expression: exp,
            });
        }

        // Default Emojis
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
                emoji: em,
            });
        }

        standardResults.sort(
            (a, b) =>
                (a.shortcode.startsWith(lowerQuery) ? 0 : 1) -
                (b.shortcode.startsWith(lowerQuery) ? 0 : 1),
        );

        const merged: Suggestion[] = [
            ...customResults,
            ...standardResults,
        ].slice(0, MAX_TOTAL);

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

            const popupHeight = ref.current?.offsetHeight ?? 260;
            const spaceAbove = caretRect.top;
            const spaceBelow = window.innerHeight - caretRect.bottom;
            const showAbove =
                spaceAbove >= popupHeight + 8 || spaceAbove > spaceBelow;

            const left = Math.min(
                Math.max(0, caretRect.left - 30),
                window.innerWidth - 296,
            );

            setCoords(
                showAbove
                    ? { top: caretRect.top - popupHeight - 25, left }
                    : { top: caretRect.bottom + 8, left },
            );
        } catch {}
    }, [visible, suggestions]);

    const select = useCallback(
        (suggestion: Suggestion) => {
            if (!range) return;

            editor.select(range);
            editor.delete();

            if (suggestion.kind === "standard")
                insertEmoji(editor, suggestion.emoji);
            else insertCustomEmoji(editor, suggestion.expression);

            setVisible(false);
        },
        [editor, range],
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
                        (i) =>
                            (i - 1 + suggestions.length) % suggestions.length,
                    );
                    break;
                case "Enter":
                case "Tab": {
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

    if (!visible || suggestions.length === 0) return null;

    console.log(coords);

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 1 : 5}
            ref={ref}
            onMouseDown={(e) => e.preventDefault()}
            css={{
                position: "fixed",
                top: coords?.top ?? -9999,
                left: coords?.left ?? 0,
            }}
            zIndex={theme.zIndex.tooltip}
            visibility={coords ? "visible" : "hidden"}
            maxHeight={260}
            width="50%"
            overflowY="auto"
            borderRadius={8}
            p="4px 0"
        >
            <Stack p="4px 12px 6px">
                <Typography
                    level="body-sm"
                    letterSpacing="0.06em"
                    fontWeight={200}
                >
                    Emoji matching <Typography>:{query}:</Typography>
                </Typography>
            </Stack>
        </Paper>
    );
};
