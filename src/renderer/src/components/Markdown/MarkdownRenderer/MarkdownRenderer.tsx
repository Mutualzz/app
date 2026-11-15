import { Link } from "@components/Link";
import { Box, Typography } from "@mutualzz/ui-web";
import parse, {
  domToReact,
  type HTMLReactParserOptions
} from "html-react-parser";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Blockquote } from "../components/Blockquote";
import { Emoji } from "../components/emoji/Emoji";
import { CustomEmoji } from "../components/emoji/CustomEmoji";
import { Spoiler } from "../components/Spoiler";
import { CodeBlock } from "../components/CodeBlock";

const collectNodeText = (nodes: any[]): string =>
  nodes
    .map((node) =>
      node.type === "text"
        ? (node.data ?? "")
        : collectNodeText(node.children ?? [])
    )
    .join("");
import type { MarkdownRendererProps } from "./MarkdownRenderer.types";
import { emphasisPlugin } from "./plugins/emphasis";
import { spoilerPlugin } from "./plugins/spoiler";
import { colorPlugin } from "./plugins/color";
import { strikethroughPlugin } from "./plugins/strikethrough";
import { underlinePlugin } from "./plugins/underline";
import { brOnEmpty } from "./plugins/brOnEmpty";
import { linkPlugin } from "./plugins/links";
import { MarkdownItAsync } from "@components/Markdown/MarkdownItAsync";
import { customEmojiPlugin } from "@components/Markdown/MarkdownRenderer/plugins/customEmoji";
import { emojiPlugin } from "@components/Markdown/MarkdownRenderer/plugins/emoji";
import { mentionPlugin } from "@components/Markdown/MarkdownRenderer/plugins/mention";
import { type DisplayNameEffect, type MentionType } from "@mutualzz/types";
import { UserMention } from "@components/Markdown/components/mention/UserMention";
import { RoleMention } from "@components/Markdown/components/mention/RoleMention";
import { DefaultMention } from "@components/Markdown/components/mention/DefaultMention";
import { isEmojiOnlyMessage } from "@utils/emojis/isEmojiOnlyMessage";
import { effectPlugin } from "./plugins/effect";
import { TextEffect } from "../components/TextEffect";

export const MarkdownRenderer = ({
  textColor = "primary",
  enlargeEmojiOnly = true,
  level,
  value,
  ...props
}: MarkdownRendererProps) => {
  const md = useMemo(() => {
    const instance = new MarkdownItAsync("default", {
      html: false,
      linkify: false,
      typographer: true,
      breaks: true
    });

    instance.linkify.set({
      fuzzyLink: false
    });

    instance.disable("emphasis");
    instance.disable("strikethrough");
    instance.disable("table");
    instance.disable("hr");
    instance.disable("escape");

    instance.renderer.rules.hardbreak = () => "<br>";
    instance.renderer.rules.softbreak = () =>
      instance.options.breaks ? "<br>" : "\n";

    instance.use(brOnEmpty);
    instance.use(spoilerPlugin);
    instance.use(colorPlugin);
    instance.use(effectPlugin);
    instance.use(mentionPlugin);
    instance.use(strikethroughPlugin);
    instance.use(emphasisPlugin);
    instance.use(underlinePlugin);
    instance.use(linkPlugin);
    instance.use(emojiPlugin);
    instance.use(customEmojiPlugin);

    return instance;
  }, []);

  const [content, setContent] = useState<ReactNode>("");

  useEffect(() => {
    let cancelled = false;
    const emojiOnly = isEmojiOnlyMessage(value, enlargeEmojiOnly);

    const loadContent = async () => {
      const html = await md.renderAsync(value);
      if (cancelled) return;

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
                  fontSize={level ? undefined : "inherit"}
                  display="block"
                  level={level}
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
                  fontSize={level ? undefined : "inherit"}
                  fontWeight="bold"
                  level={level}
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
                  fontSize={level ? undefined : "inherit"}
                  fontStyle="italic"
                  level={level}
                  textColor={textColor}
                >
                  {children}
                </Typography>
              );
            }
            case "del":
            case "s": {
              const children = domToReact(
                (domNode.children ?? []) as any,
                options
              );
              return (
                <Typography
                  whiteSpace="pre-wrap"
                  fontSize={level ? undefined : "inherit"}
                  textDecoration="line-through"
                  level={level}
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
                  fontSize={level ? undefined : "inherit"}
                  textDecoration="underline"
                  level={level}
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
            case "span": {
              const effect = domNode.attribs?.["data-markdown-effect"];
              if (effect) {
                const effectChildren = domToReact(
                  (domNode.children ?? []) as any,
                  options
                );
                return (
                  <TextEffect effect={effect as DisplayNameEffect}>
                    {effectChildren}
                  </TextEffect>
                );
              }

              const hex = domNode.attribs?.["data-markdown-color"];
              if (!hex) return undefined;

              const children = domToReact(
                (domNode.children ?? []) as any,
                options
              );

              return (
                <Typography
                  whiteSpace="pre-wrap"
                  fontSize={level ? undefined : "inherit"}
                  level={level}
                  textColor={hex as any}
                  css={{ color: hex }}
                >
                  {children}
                </Typography>
              );
            }
            case "emoji": {
              const {
                ["data-name"]: name,
                ["data-url"]: url,
                ["data-unicode"]: unicode
              } = domNode.attribs ?? {};

              return (
                <Emoji
                  isEmojiOnly={emojiOnly}
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
                  isEmojiOnly={emojiOnly}
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
                default:
                  return null;
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
                  color="info"
                  variant="plain"
                >
                  {children}
                </Link>
              );
            }
            case "ul": {
              const children = domToReact(
                (domNode.children ?? []) as any,
                options
              );
              return (
                <ul
                  style={{
                    margin: "0.5em 0",
                    paddingLeft: "1.5em",
                    listStyleType: "disc",
                    listStylePosition: "outside"
                  }}
                >
                  {children}
                </ul>
              );
            }
            case "ol": {
              const children = domToReact(
                (domNode.children ?? []) as any,
                options
              );
              return (
                <ol
                  style={{
                    margin: "0.5em 0",
                    paddingLeft: "1.5em",
                    listStyleType: "decimal",
                    listStylePosition: "outside"
                  }}
                >
                  {children}
                </ol>
              );
            }
            case "li": {
              const children = domToReact(
                (domNode.children ?? []) as any,
                options
              );
              return (
                <li style={{ marginBottom: "0.35em" }}>
                  <Typography
                    whiteSpace="pre-wrap"
                    fontSize={level ? undefined : "inherit"}
                    level={level}
                    textColor={textColor}
                  >
                    {children}
                  </Typography>
                </li>
              );
            }
            case "pre": {
              const codeNode = (domNode.children ?? []).find(
                (child: any) => child.type === "tag" && child.name === "code"
              ) as any;
              const className: string = codeNode?.attribs?.class ?? "";
              const language = className.startsWith("language-")
                ? className.slice("language-".length)
                : null;
              const code = collectNodeText(
                codeNode?.children ?? domNode.children ?? []
              ).replace(/\n$/, "");
              return <CodeBlock code={code} language={language} />;
            }
            case "br":
              return <br />;
            default:
              return undefined;
          }
        }
      };

      setContent(parse(html, options));
    };

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [value, enlargeEmojiOnly, textColor, level]);

  return (
    <Box
      display="block"
      height="100%"
      overflowY="auto"
      fontSize="inherit"
      {...props}
    >
      {content}
    </Box>
  );
};
