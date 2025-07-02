import { Typography, useTheme } from "@ui/index";
import ReactMarkdown, {
    type Components as MarkdownComponents,
} from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkParse from "remark-parse";
import type { MarkdownRendererProps } from "../../routes/ui/data-display/Markdown.types";

import type { ReactElement } from "react";
import remarkRehype from "remark-rehype";
import type { EmojiNode } from "../../types/mdast";
import { remarkEmoji } from "../../utils/remark/remarkEmoji";
import { remarkLimitHeading } from "../../utils/remark/remarkLimitHeading";

interface Components extends MarkdownComponents {
    emoji: (props: EmojiNode) => ReactElement;
}

export const MarkdownRenderer = ({ value }: MarkdownRendererProps) => {
    const { theme } = useTheme();

    return (
        <ReactMarkdown
            remarkPlugins={[
                remarkBreaks,
                remarkParse,
                remarkEmoji,
                remarkLimitHeading,
                remarkRehype,
            ]}
            rehypePlugins={[rehypeRaw]}
            components={
                {
                    h1: ({ children }) => (
                        <Typography level="h3" display="block">
                            {children}
                        </Typography>
                    ),

                    h2: ({ children }) => (
                        <Typography level="h4" display="block">
                            {children}
                        </Typography>
                    ),

                    h3: ({ children }) => (
                        <Typography level="h5" display="block">
                            {children}
                        </Typography>
                    ),

                    p: ({ children }) => (
                        <Typography level="body-md">{children}</Typography>
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
                        <Typography fontWeight="bold">{children}</Typography>
                    ),

                    em: ({ children }) => (
                        <Typography fontStyle="italic">{children}</Typography>
                    ),

                    del: ({ children }) => (
                        <Typography textDecoration="line-through">
                            {children}
                        </Typography>
                    ),

                    u: ({ children }) => (
                        <Typography textDecoration="underline">
                            {children}
                        </Typography>
                    ),

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

                    emoji: ({ url, shortcode, value: emojiChar }) => (
                        <span
                            role="button"
                            tabIndex={0}
                            aria-label={emojiChar}
                            title={`:${shortcode}:`}
                            css={{
                                display: "inline-block",
                            }}
                        >
                            <img
                                src={url}
                                alt={emojiChar}
                                draggable={false}
                                aria-label={emojiChar}
                                css={{
                                    width: "1.375em",
                                    height: "1.375em",
                                    verticalAlign: "middle",
                                }}
                            />
                        </span>
                    ),
                } as Components
            }
        >
            {value}
        </ReactMarkdown>
    );
};
