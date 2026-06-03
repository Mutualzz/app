import { Link } from "@components/Link";
import { Box, Typography } from "@mutualzz/ui-web";
import emojiRegexOrig from "emojibase-regex";
import shortcodeRegexOrig from "emojibase-regex/shortcode";
import parse, {
    domToReact,
    type HTMLReactParserOptions
} from "html-react-parser";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Blockquote } from "../components/Blockquote";
import { Emoji } from "../components/emoji/Emoji";
import { CustomEmoji } from "../components/emoji/CustomEmoji";
import { Spoiler } from "../components/Spoiler";
import type { MarkdownRendererProps } from "./MarkdownRenderer.types";
import { emphasisPlugin } from "./plugins/emphasis";
import { spoilerPlugin } from "./plugins/spoiler";
import { strikethroughPlugin } from "./plugins/strikethrough";
import { underlinePlugin } from "./plugins/underline";
import { brOnEmpty } from "./plugins/brOnEmpty";
import { linkPlugin } from "./plugins/links";
import { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";
import { customEmojiPlugin } from "@components/Markdown/MarkdownRenderer/plugins/customEmoji";
import { emojiPlugin } from "@components/Markdown/MarkdownRenderer/plugins/emoji";
import { mentionPlugin } from "@components/Markdown/MarkdownRenderer/plugins/mention";
import { MentionType } from "@mutualzz/types";
import { UserMention } from "@components/Markdown/components/mention/UserMention";
import { RoleMention } from "@components/Markdown/components/mention/RoleMention";
import { DefaultMention } from "@components/Markdown/components/mention/DefaultMention";

const shortcodeRegex = new RegExp(shortcodeRegexOrig.source, "g");
const emojiRegex = new RegExp(emojiRegexOrig.source, "gu");

// TODO: add code blocks in the future
export const MarkdownRenderer = ({
    textColor = "primary",
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
            breaks: false
        });

        instance.linkify.set({
            fuzzyLink: false
        });

        instance.disable("emphasis");
        instance.disable("table");
        instance.disable("hr");
        instance.disable("escape");

        instance.use(brOnEmpty);
        instance.use(spoilerPlugin);
        instance.use(emojiPlugin);
        instance.use(customEmojiPlugin);
        instance.use(mentionPlugin);
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
                                options
                            );
                            return (
                                <Typography
                                    level="h3"
                                    fontWeight="bold"
                                    display="block"
                                    textColor={textColor}
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "h2": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            return (
                                <Typography
                                    level="h4"
                                    fontWeight="bold"
                                    display="block"
                                    textColor={textColor}
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "p": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            return (
                                <Typography
                                    whiteSpace="pre-wrap"
                                    fontSize="inherit"
                                    display="block"
                                    textColor={textColor}
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "h3": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            return (
                                <Typography
                                    level="h5"
                                    fontWeight="bold"
                                    display="block"
                                    textColor={textColor}
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "blockquote": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            return <Blockquote>{children}</Blockquote>;
                        }
                        case "strong": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            return (
                                <Typography
                                    whiteSpace="pre-wrap"
                                    fontSize="inherit"
                                    fontWeight="bold"
                                    textColor={textColor}
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "em": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            return (
                                <Typography
                                    whiteSpace="pre-wrap"
                                    fontSize="inherit"
                                    fontStyle="italic"
                                    textColor={textColor}
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "del": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            return (
                                <Typography
                                    fontSize="inherit"
                                    textDecoration="line-through"
                                    textColor={textColor}
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "u": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            return (
                                <Typography
                                    whiteSpace="pre-wrap"
                                    fontSize="inherit"
                                    textDecoration="underline"
                                    textColor={textColor}
                                >
                                    {children}
                                </Typography>
                            );
                        }
                        case "spoiler": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            return <Spoiler>{children}</Spoiler>;
                        }
                        case "emoji": {
                            const {
                                ["data-name"]: name,
                                ["data-url"]: url,
                                ["data-unicode"]: unicode
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
                                ["data-animated"]: animated
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
                        case "mention": {
                            const { ["data-type"]: mType, ["data-id"]: mId } =
                                domNode.attribs ?? {};
                            const type = mType as MentionType | undefined;
                            const id = mId ?? "";

                            switch (type) {
                                case "user":
                                    return <UserMention userId={id} />;
                                case "role":
                                    return <RoleMention roleId={id} />;
                                case "here":
                                case "everyone":
                                    return <DefaultMention mentionId={id} />;
                            }
                        }
                        case "a": {
                            const children = domToReact(
                                (domNode.children ?? []) as any,
                                options
                            );
                            const { href } = (domNode as any).attribs ?? {};
                            return (
                                <Link
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    textColor={textColor ?? "muted"}
                                >
                                    {children}
                                </Link>
                            );
                        }
                        default:
                            return <></>;
                    }
                }
            };

            const content = parse(html, options);

            setContent(content);
        };

        loadContent();
    }, [value]);

    return (
        <Box display="block" height="100%" overflowY="auto" {...props}>
            {content}
        </Box>
    );
};
