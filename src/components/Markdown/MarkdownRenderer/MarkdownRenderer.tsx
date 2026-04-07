import { Link } from "@components/Link";
import { Paper } from "@components/Paper";
import { Typography } from "@mutualzz/ui-web";
import emojiRegexOrig from "emojibase-regex";
import shortcodeRegexOrig from "emojibase-regex/shortcode";
import parse, {
    domToReact,
    type HTMLReactParserOptions,
} from "html-react-parser";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Blockquote } from "../components/Blockquote";
import { Emoji } from "../components/Emoji";
import { CustomEmoji } from "../components/CustomEmoji";
import { Spoiler } from "../components/Spoiler";
import type { MarkdownRendererProps } from "./MarkdownRenderer.types";
import { emphasisPlugin } from "./plugins/emphasis";
import { spoilerPlugin } from "./plugins/spoiler";
import { strikethroughPlugin } from "./plugins/strikethrough";
import { underlinePlugin } from "./plugins/underline";
import { brOnEmpty } from "./plugins/brOnEmpty";
import { linkPlugin } from "./plugins/links";
import { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync.ts";
import { customEmojiPlugin } from "@components/Markdown/MarkdownRenderer/plugins/customEmoji.ts";
import { emojiPlugin } from "@components/Markdown/MarkdownRenderer/plugins/emoji.ts";

const shortcodeRegex = new RegExp(shortcodeRegexOrig.source, "g");
const emojiRegex = new RegExp(emojiRegexOrig.source, "gu");

// TODO: add code blocks in the future
export const MarkdownRenderer = ({
    color = "neutral",
    textColor = "primary",
    variant = "outlined",
    enlargeEmojiOnly = true,
    value,
    ...props
}: MarkdownRendererProps) => {
    const isEmojiOnly = useMemo(() => {
        if (!value || !enlargeEmojiOnly) return false;

        const textWithoutEmojis = value
            .replace(/<a?:[^:]+:\d+>/g, "")
            .replace(shortcodeRegex, "")
            .replace(emojiRegex, "");

        return textWithoutEmojis.trim().length === 0 && value.trim().length > 0;
    }, [value, enlargeEmojiOnly]);

    const md = useMemo(() => {
        const instance = new MarkdownItAsync("default", {
            html: false,
            linkify: false,
            typographer: true,
            breaks: false,
        });

        instance.linkify.set({
            fuzzyLink: false,
        });

        instance.disable("emphasis");
        instance.disable("table");
        instance.disable("hr");
        instance.disable("escape");

        instance.use(brOnEmpty);
        instance.use(spoilerPlugin);
        instance.use(emojiPlugin);
        instance.use(customEmojiPlugin);
        instance.use(strikethroughPlugin);
        instance.use(emphasisPlugin);
        instance.use(underlinePlugin);
        instance.use(linkPlugin);

        return instance;
    }, []);

    const [content, setContent] = useState<ReactNode>("");

    useEffect(() => {
        const loadContent = async () => {
            const html = await md.renderAsync(value);
            const options: HTMLReactParserOptions = {
                replace: (domNode) => {
                    if (domNode.type !== "tag") return undefined;

                    switch (domNode.name) {
                        case "h1": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return (
                                <Typography
                                    level="h3"
                                    fontWeight="bold"
                                    display="block"
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "h2": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return (
                                <Typography
                                    level="h4"
                                    fontWeight="bold"
                                    display="block"
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "p": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return (
                                <Typography
                                    whiteSpace="pre-wrap"
                                    fontSize="inherit"
                                    display="block"
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "h3": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return (
                                <Typography
                                    level="h5"
                                    fontWeight="bold"
                                    display="block"
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "blockquote": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return <Blockquote>{children}</Blockquote>;
                        }
                        case "strong": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return (
                                <Typography
                                    whiteSpace="pre-wrap"
                                    fontSize="inherit"
                                    fontWeight="bold"
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "em": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return (
                                <Typography
                                    whiteSpace="pre-wrap"
                                    fontSize="inherit"
                                    fontStyle="italic"
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "del": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return (
                                <Typography
                                    fontSize="inherit"
                                    textDecoration="line-through"
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "u": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return (
                                <Typography
                                    whiteSpace="pre-wrap"
                                    fontSize="inherit"
                                    textDecoration="underline"
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "spoiler": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            return <Spoiler>{children}</Spoiler>;
                        }
                        case "emoji": {
                            const {
                                ["data-name"]: name,
                                ["data-url"]: url,
                                ["data-unicode"]: unicode,
                            } = domNode.attribs ?? {};

                            return (
                                <Emoji
                                    isEmojiOnly={isEmojiOnly}
                                    url={url}
                                    unicode={unicode}
                                    name={name}
                                />
                            );
                        }
                        case "customemoji": {
                            const {
                                ["data-name"]: name,
                                ["data-url"]: url,
                                ["data-id"]: id,
                                ["data-animated"]: animated,
                            } = domNode.attribs ?? {};

                            return (
                                <CustomEmoji
                                    isEmojiOnly={isEmojiOnly}
                                    url={url}
                                    name={name}
                                    id={id}
                                    animated={animated === "true"}
                                />
                            );
                        }
                        case "a": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options,
                            );
                            const { href } = (domNode as any).attribs ?? {};
                            return (
                                <Link
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    textColor="muted"
                                >
                                    {children}
                                </Link>
                            );
                        }
                    }
                },
            };

            const content = parse(html, options);

            setContent(content);
        };

        loadContent();
    }, [value]);

    return (
        <Paper
            color={color as any}
            textColor={textColor}
            variant={variant}
            display="block"
            height="100%"
            overflowY="auto"
            {...props}
        >
            {content}
        </Paper>
    );
};
