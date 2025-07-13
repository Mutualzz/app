import { Paper, Typography, useTheme } from "@mutualzz/ui";

import type {
    EmojiNode,
    SpoilerNode,
    StrikethroughNode,
    UnderlineNode,
} from "@app-types/mdast";
import { spoilerStyles } from "@css/spoilerStyles";
import { useState, type ReactElement } from "react";
import ReactMarkdown, {
    type Components as MarkdownComponents,
} from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkParse from "remark-parse";
import type { MarkdownRendererProps } from "./Markdown.types";
import { remarkEmoji } from "./remark/remarkEmoji";
import { remarkLimitHeading } from "./remark/remarkLimitHeading";
import { remarkSpoiler } from "./remark/spoiler/remarkSpoiler";
import { remarkStrikethrough } from "./remark/strikethrough/remarkStrikethrough";
import { remarkUnderline } from "./remark/underline/remarkUnderline";

interface Components extends MarkdownComponents {
    emoji: (props: EmojiNode) => ReactElement;
    spoiler: (props: SpoilerNode) => ReactElement;
    underline: (props: UnderlineNode) => ReactElement;
    strikethrough: (props: StrikethroughNode) => ReactElement;
}

export const MarkdownRenderer = ({
    color = "neutral",
    textColor = "primary",
    variant = "outlined",
    value,
}: MarkdownRendererProps) => {
    const { theme } = useTheme();

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
            <ReactMarkdown
                remarkPlugins={[
                    remarkBreaks,
                    remarkLimitHeading,
                    remarkSpoiler,
                    remarkUnderline,
                    remarkStrikethrough,
                    remarkEmoji,
                    remarkParse,
                ]}
                components={
                    {
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
                            <Typography fontSize="inherit">
                                {children}
                            </Typography>
                        ),

                        blockquote: ({ children }) => (
                            <blockquote
                                css={{
                                    display: "block",
                                    margin: 0,
                                    paddingLeft: "0.5em",
                                    borderLeft: `4px solid ${theme.typography.colors.disabled}`,
                                    color: theme.typography.colors.primary,
                                }}
                            >
                                {children}
                            </blockquote>
                        ),

                        strong: ({ children }) => (
                            <Typography fontSize="inherit" fontWeight="bold">
                                {children}
                            </Typography>
                        ),

                        em: ({ children }) => (
                            <Typography fontSize="inherit" fontStyle="italic">
                                {children}
                            </Typography>
                        ),

                        strikethrough: ({ children }) => (
                            <Typography
                                fontSize="inherit"
                                textDecoration="line-through"
                            >
                                {children}
                            </Typography>
                        ),

                        underline: ({ children }) => {
                            return (
                                <Typography
                                    fontSize="inherit"
                                    textDecoration="underline"
                                >
                                    {children}
                                </Typography>
                            );
                        },

                        code: ({ children }) => (
                            <Typography
                                fontFamily="monospace"
                                fontSize="inherit"
                                css={{
                                    background: "rgba(255,255,255,0.05)",
                                    padding: "0.2em 0.4em",
                                    borderRadius: 4,
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
                                    width: "1.375em",
                                    height: "1.375em",
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
                                <span
                                    css={spoilerStyles(revealed, theme)}
                                    onClick={() => {
                                        setRevealed(true);
                                    }}
                                >
                                    {children}
                                </span>
                            );
                        },
                    } as Components
                }
            >
                {value}
            </ReactMarkdown>
        </Paper>
    );
};
