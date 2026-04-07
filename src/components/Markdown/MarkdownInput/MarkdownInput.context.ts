import { createContext } from "react";

interface MarkdownInputContext {
    activeFormats: string[];
    enableEmoticons?: boolean;
    enableHoverToolbar?: boolean;
    enableEmojis?: boolean;
}

export const MarkdownInputContext = createContext<MarkdownInputContext>({
    activeFormats: [],
    enableEmoticons: true,
    enableHoverToolbar: true,
    enableEmojis: true,
});
