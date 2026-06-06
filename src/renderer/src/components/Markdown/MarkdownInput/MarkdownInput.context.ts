import { createContext, useContext } from "react";

interface MarkdownInputContext {
  activeFormats: string[];
  enableEmoticons?: boolean;
  enableHoverToolbar?: boolean;
  enableEmojis?: boolean;
  onSendMessage?: (message?: string) => void;
}

export const MarkdownInputContext = createContext<MarkdownInputContext>({
  activeFormats: [],
  enableEmoticons: true,
  enableHoverToolbar: true,
  enableEmojis: true
});

export const useMarkdownInputContext = () => useContext(MarkdownInputContext);
