import { Link } from "@components/Link";
import { Paper } from "@components/Paper";
import { Typography } from "@mutualzz/ui-web";
import emojiRegexOrig from "emojibase-regex";
import shortcodeRegexOrig from "emojibase-regex/shortcode";
import parse, { domToReact } from "html-react-parser";
import MarkdownIt from "markdown-it";
import { useMemo } from "react";
import { Blockquote } from "../components/Blockquote";
import { Emoji } from "../components/Emoji";
import { Spoiler } from "../components/Spoiler";
import type { MarkdownRendererProps } from "./MarkdownRenderer.types";
import { emojiPlugin } from "./plugins/emoji";
import { emphasisPlugin } from "./plugins/emphasis";
import { spoilerPlugin } from "./plugins/spoiler";
import { strikethroughPlugin } from "./plugins/strikethrough";
import { underlinePlugin } from "./plugins/underline";

const shortcodeRegex = new RegExp(shortcodeRegexOrig.source, "g");
const emojiRegex = new RegExp(emojiRegexOrig.source, "gu");

// TODO: add code blocks in the future
// TODO: Fix spoilers not rendering emojis correctly
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
            .replace(shortcodeRegex, "")
            .replace(emojiRegex, "");

        return textWithoutEmojis.trim().length === 0 && value.trim().length > 0;
    }, [value, enlargeEmojiOnly]);

    const md = useMemo(() => {
        const instance = new MarkdownIt("default", {
            html: false,
            linkify: true,
            typographer: true,
            breaks: true,
        });

        instance.linkify.set({
            fuzzyLink: false,
        });

        instance.disable("emphasis");
        instance.disable("table");
        instance.disable("hr");
        instance.disable("escape");

        instance.use(spoilerPlugin);
        instance.use(emojiPlugin);
        instance.use(strikethroughPlugin);
        instance.use(emphasisPlugin);
        instance.use(underlinePlugin);

        return instance;
    }, []);

    const html = useMemo(() => md.render(value || ""), [md, value]);

    const content = useMemo(
        () =>
            parse(html, {
                replace: (domNode) => {
                    if (domNode.type === "tag") {
                        switch (domNode.name) {
                            case "h1": {
                                return (
                                    <Typography
                                        level="h3"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        {domToReact(domNode.children as any)}
                                    </Typography>
                                );
                            }
                            case "h2": {
                                return (
                                    <Typography
                                        level="h4"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        {domToReact(domNode.children as any)}
                                    </Typography>
                                );
                            }
                            case "h3": {
                                return (
                                    <Typography
                                        level="h5"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        {domToReact(domNode.children as any)}
                                    </Typography>
                                );
                            }
                            case "blockquote": {
                                return (
                                    <Blockquote>
                                        {domToReact(domNode.children as any)}
                                    </Blockquote>
                                );
                            }
                            case "strong": {
                                return (
                                    <Typography
                                        whiteSpace="pre-wrap"
                                        fontSize="inherit"
                                        fontWeight="bold"
                                    >
                                        {domToReact(domNode.children as any)}
                                    </Typography>
                                );
                            }
                            case "em": {
                                return (
                                    <Typography
                                        whiteSpace="pre-wrap"
                                        fontSize="inherit"
                                        fontStyle="italic"
                                    >
                                        {domToReact(domNode.children as any)}
                                    </Typography>
                                );
                            }
                            case "del": {
                                return (
                                    <Typography
                                        fontSize="inherit"
                                        textDecoration="line-through"
                                    >
                                        {domToReact(domNode.children as any)}
                                    </Typography>
                                );
                            }
                            case "u": {
                                return (
                                    <Typography
                                        whiteSpace="pre-wrap"
                                        fontSize="inherit"
                                        textDecoration="underline"
                                    >
                                        {domToReact(domNode.children as any)}
                                    </Typography>
                                );
                            }
                            case "spoiler": {
                                return (
                                    <Spoiler>
                                        {domToReact(domNode.children as any)}
                                    </Spoiler>
                                );
                            }
                            case "emoji": {
                                const {
                                    ["data-name"]: name,
                                    ["data-url"]: url,
                                    ["data-unicode"]: unicode,
                                } = domNode.attribs;

                                return (
                                    <Emoji
                                        isEmojiOnly={isEmojiOnly}
                                        url={url}
                                        unicode={unicode}
                                        name={name}
                                    />
                                );
                            }
                            case "a": {
                                const { href } = domNode.attribs;
                                return (
                                    <Link
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        textColor="muted"
                                    >
                                        {domToReact(domNode.children as any)}
                                    </Link>
                                );
                            }
                        }
                    }
                },
            }),
        [html, isEmojiOnly],
    );

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
