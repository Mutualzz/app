import { createContext, useContext } from "react";
import type { Expression } from "@stores/objects/Expression";

interface MarkdownInputContext {
  activeFormats: string[];
  enableEmoticons?: boolean;
  enableHoverToolbar?: boolean;
  enableEmojis?: boolean;
  onSendMessage?: (message?: string) => void;
  onSelectSticker?: (sticker: Expression) => void;
}

export const MarkdownInputContext = createContext<MarkdownInputContext>({
  activeFormats: [],
  enableEmoticons: true,
  enableHoverToolbar: true,
  enableEmojis: true
});

export const useMarkdownInputContext = () => useContext(MarkdownInputContext);
