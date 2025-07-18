import { createContext } from "react";

interface MarkdownInputContext {
    activeFormats: string[];
    enableEmoticons?: boolean;
    enableHoverToolbar?: boolean;
}

export const MarkdownInputContext = createContext<MarkdownInputContext>({
    activeFormats: [],
    enableEmoticons: true,
    enableHoverToolbar: true,
});
