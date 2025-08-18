import { Paper, Typography } from "@mutualzz/ui";

import emojiRegexOrig from "emojibase-regex";
import shortcodeRegexOrig from "emojibase-regex/shortcode";
import { useMemo } from "react";
import { Blockquote } from "../components/Blockquote";
import { CodeBlock } from "../components/CodeBlock";
import { Emoji } from "../components/Emoji";
import { Spoiler } from "../components/Spoiler";
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
    const isEmojiOnly = useMemo(() => {
        if (!value || !enlargeEmojiOnly) return false;

        const textWithoutEmojis = value
            .replace(shortcodeRegex, "")
            .replace(emojiRegex, "");

        return textWithoutEmojis.trim().length === 0 && value.trim().length > 0;
    }, [value, enlargeEmojiOnly]);

    return (
        <Paper
            color={color as string}
            textColor={textColor}
            variant={variant}
            display="block"
            height="100%"
            p={12}
            mt={10}
            overflowY="auto"
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
                        <Blockquote>{children}</Blockquote>
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

                    emoji: ({ name, url, unicode }) => (
                        <Emoji
                            isEmojiOnly={isEmojiOnly}
                            url={url}
                            unicode={unicode}
                            name={name}
                        />
                    ),

                    spoiler: ({ children }) => <Spoiler>{children}</Spoiler>,

                    blockCode: ({ children, className }) => (
                        <CodeBlock className={className}>{children}</CodeBlock>
                    ),

                    inlineCode: ({ children, className }) => (
                        <CodeBlock className={className} inline>
                            {children}
                        </CodeBlock>
                    ),
                }}
            >
                {value}
            </Markdown>
        </Paper>
    );
};
