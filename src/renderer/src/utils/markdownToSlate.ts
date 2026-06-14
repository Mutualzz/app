import type { Descendant } from "slate";
import { getEmoji } from "./emojis/emojis";
import { TWEMOJI_URL } from "./urls";
import { useAppStore } from "@hooks/useStores";

export function markdownToSlate(markdown: string): Descendant[] {
  const lines = markdown.split(/\r?\n/);
  const result: Descendant[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      result.push({ type: "line", children: [{ text: "" }] });
      continue;
    }

    const headingMatch = /^#{1,3} /.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[0].trim().length as 1 | 2 | 3;
      result.push({
        type: "heading",
        level,
        children: parseInlineMarkdown(trimmed.slice(level + 1))
      });
      continue;
    }

    if (trimmed.startsWith(">")) {
      result.push({
        type: "blockquote",
        children: [
          {
            type: "line",
            children: parseInlineMarkdown(trimmed.replace(/^>\s?/, ""))
          }
        ]
      });
      continue;
    }

    result.push({
      type: "line",
      children: parseInlineMarkdown(trimmed)
    });
  }

  return result;
}

const VOID_INLINE_PATTERN =
  /(<a?:[^:]+:\d+>|<@&?\d+>|@everyone|@here|:[a-zA-Z0-9_]+:)/g;

function parseInlineMarkdown(input: string): Descendant[] {
  const parts = input.split(VOID_INLINE_PATTERN);
  const nodes: Descendant[] = [];

  for (const part of parts) {
    if (!part) continue;

    // custom emoji  <a:name:id>  or  <:name:id>
    const customEmojiMatch = /^<(a)?:([^:]+):(\d+)>$/.exec(part);
    if (customEmojiMatch) {
      const id = customEmojiMatch[3];
      const expression = useAppStore().expressions.get(id);

      nodes.push({
        type: "customEmoji",
        name: customEmojiMatch[2],
        id,
        animated: !!customEmojiMatch[1],
        url: expression?.url ?? "",
        children: [{ text: "" }]
      });
      continue;
    }

    // user mention  <@id>
    const userMentionMatch = /^<@(\d+)>$/.exec(part);
    if (userMentionMatch) {
      nodes.push({
        type: "mention",
        mentionType: "user",
        id: userMentionMatch[1],
        children: [{ text: "" }]
      });
      continue;
    }

    // role mention  <@&id>
    const roleMentionMatch = /^<@&(\d+)>$/.exec(part);
    if (roleMentionMatch) {
      nodes.push({
        type: "mention",
        mentionType: "role",
        id: roleMentionMatch[1],
        children: [{ text: "" }]
      });
      continue;
    }

    if (part === "@everyone") {
      nodes.push({
        type: "mention",
        mentionType: "everyone",
        id: "everyone",
        children: [{ text: "" }]
      });
      continue;
    }
    if (part === "@here") {
      nodes.push({
        type: "mention",
        mentionType: "here",
        id: "here",
        children: [{ text: "" }]
      });
      continue;
    }

    // standard emoji shortcode  :smile:
    const shortcodeMatch = /^:[a-zA-Z0-9_]+:$/.exec(part);
    if (shortcodeMatch) {
      const shortcode = part.slice(1, -1).toLowerCase();
      const emoji = getEmoji(shortcode);
      if (emoji) {
        nodes.push({
          type: "emoji",
          name: `:${emoji.shortcodes?.[0]}:`,
          url: `${TWEMOJI_URL}/${emoji.hexcode.toLowerCase()}.png`,
          unicode: emoji.emoji,
          children: [{ text: "" }]
        });
        continue;
      }
    }

    // Plain text — raw markdown preserved for decorate
    nodes.push({ text: part });
  }

  return nodes;
}
