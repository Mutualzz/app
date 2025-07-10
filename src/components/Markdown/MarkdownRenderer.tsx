import { dynamicElevation, Typography, useTheme } from "@ui/index";
import { useState, type ReactElement } from "react";
import ReactMarkdown, {
    type Components as MarkdownComponents,
} from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { EmojiNode, SpoilerNode } from "../../types/mdast";
import type { MarkdownRendererProps } from "./Markdown.types";
import { remarkEmoji } from "./remark/remarkEmoji";
import { remarkLimitHeading } from "./remark/remarkLimitHeading";
import { remarkSpoiler } from "./remark/remarkSpoiler";

interface Components extends MarkdownComponents {
    emoji: (props: EmojiNode) => ReactElement;
    spoiler: (props: SpoilerNode) => ReactElement;
}

export const MarkdownRenderer = ({ value }: MarkdownRendererProps) => {
    const { theme } = useTheme();

    return (
        <ReactMarkdown
            remarkPlugins={[
                remarkBreaks,
                remarkParse,
                remarkEmoji,
                remarkSpoiler,
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
                                pointerEvents: "none",
                                userSelect: "none",
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

                    spoiler: ({ text }) => {
                        const [isOpen, setIsOpen] = useState(false);
                        return (
                            <span
                                role={isOpen ? "button" : "presentation"}
                                contentEditable={false}
                                css={{
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                    borderRadius: 4,
                                    paddingInline: "1px",
                                    ...(!isOpen
                                        ? {
                                              backgroundColor:
                                                  theme.typography.colors
                                                      .disabled,
                                              color: "transparent",
                                              cursor: "pointer",
                                              userSelect: "none",
                                          }
                                        : {
                                              backgroundColor: dynamicElevation(
                                                  theme.colors.surface,
                                                  5,
                                              ),
                                          }),
                                    transition:
                                        "background-color 0.2s; color 5s",
                                }}
                                onClick={() => {
                                    setIsOpen(true);
                                }}
                            >
                                {text}
                            </span>
                        );
                    },
                } as Components
            }
        >
            {value}
        </ReactMarkdown>
    );
};
