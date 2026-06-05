import { createContext, useContext } from "react";

interface MarkdownInputContext {
    activeFormats: string[];
    enableEmoticons?: boolean;
    enableHoverToolbar?: boolean;
    enableEmojis?: boolean;
    onSendMessage?: () => void;
}

export const MarkdownInputContext = createContext<MarkdownInputContext>({
    activeFormats: [],
    enableEmoticons: true,
    enableHoverToolbar: true,
    enableEmojis: true
});

export const useMarkdownInputContext = () => useContext(MarkdownInputContext);
