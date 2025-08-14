import { Paper, Typography, useTheme } from "@mutualzz/ui";

import { spoilerStyles } from "@css/spoilerStyles";
import emojiRegexOrig from "emojibase-regex";
import shortcodeRegexOrig from "emojibase-regex/shortcode";
import { useMemo, useState } from "react";
import { Markdown } from "./Markdown";
import type { MarkdownRendererProps } from "./MarkdownRenderer.types";

const shortcodeRegex = new RegExp(shortcodeRegexOrig.source, "g");
const emojiRegex = new RegExp(emojiRegexOrig.source, "gu");

export const MarkdownRenderer = ({
    color = "neutral",
    textColor = "primary",
    variant = "outlined",
    enlargeEmojiOnly = true,
    value,
}: MarkdownRendererProps) => {
    const { theme } = useTheme();

    const isEmojiOnly = useMemo(() => {
        if (!value || !enlargeEmojiOnly) return false;

        const textWithoutEmojis = value
            .replace(shortcodeRegex, "")
            .replace(emojiRegex, "");

        return textWithoutEmojis.trim().length === 0 && value.trim().length > 0;
    }, [value, enlargeEmojiOnly]);

    return (
        <Paper
            color={color}
            textColor={textColor}
            variant={variant}
            display="block"
            height="100%"
            p={12}
            mt={10}
        >
            <Markdown
                components={{
                    h1: ({ children }) => (
                        <Typography
                            level="h3"
                            fontWeight="bold"
                            display="block"
                        >
                            {children}
                        </Typography>
                    ),

                    h2: ({ children }) => (
                        <Typography
                            level="h4"
                            fontWeight="bold"
                            display="block"
                        >
                            {children}
                        </Typography>
                    ),

                    h3: ({ children }) => (
                        <Typography
                            level="h5"
                            fontWeight="bold"
                            display="block"
                        >
                            {children}
                        </Typography>
                    ),

                    p: ({ children }) => (
                        <Typography
                            whiteSpace="break-spaces"
                            fontSize="inherit"
                            display="inline"
                        >
                            {children}
                        </Typography>
                    ),

                    blockquote: ({ children }) => (
                        <blockquote
                            css={{
                                display: "block",
                                margin: 0,
                                paddingLeft: "0.5em",
                                borderLeft: `4px solid ${theme.typography.colors.muted}`,
                                color: theme.typography.colors.primary,
                            }}
                        >
                            {children}
                        </blockquote>
                    ),

                    strong: ({ children }) => (
                        <Typography
                            whiteSpace="pre-wrap"
                            fontSize="inherit"
                            fontWeight="bold"
                        >
                            {children}
                        </Typography>
                    ),

                    em: ({ children }) => (
                        <Typography
                            whiteSpace="pre-wrap"
                            fontSize="inherit"
                            fontStyle="italic"
                        >
                            {children}
                        </Typography>
                    ),

                    del: ({ children }) => (
                        <Typography
                            fontSize="inherit"
                            textDecoration="line-through"
                        >
                            {children}
                        </Typography>
                    ),

                    u: ({ children }) => (
                        <Typography
                            whiteSpace="pre-wrap"
                            fontSize="inherit"
                            textDecoration="underline"
                        >
                            {children}
                        </Typography>
                    ),

                    code: ({ children }) => (
                        <Typography
                            fontFamily="monospace"
                            fontSize="inherit"
                            padding="0.2em 0.4em"
                            borderRadius={4}
                            css={{
                                background: "rgba(255,255,255,0.05)",
                            }}
                        >
                            {children}
                        </Typography>
                    ),

                    emoji: ({ name, url, unicode }) => (
                        <span
                            role="button"
                            aria-label={`:${name}:`}
                            contentEditable={false}
                            title={`:${name}:`}
                            css={{
                                display: "inline-block",
                                width: isEmojiOnly ? "2.25em" : "1.375em",
                                height: isEmojiOnly ? "2.25em" : "1.375em",
                                verticalAlign: "middle",
                            }}
                        >
                            <img
                                src={url}
                                alt={unicode}
                                draggable={false}
                                aria-label={`:${name}:`}
                                css={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </span>
                    ),

                    spoiler: ({ children }) => {
                        const [revealed, setRevealed] = useState(false);

                        return (
                            <Typography
                                css={spoilerStyles(revealed, theme)}
                                onClick={() => {
                                    setRevealed(true);
                                }}
                            >
                                {children}
                            </Typography>
                        );
                    },
                }}
            >
                {value}
            </Markdown>
        </Paper>
    );
};
