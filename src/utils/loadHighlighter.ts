import { type Highlighter, createHighlighter } from "shiki";

let cachedHighlighter: Highlighter | null = null;

export async function loadHighlighter(): Promise<Highlighter> {
    if (cachedHighlighter) return cachedHighlighter;

    const highlighter = await createHighlighter({
        themes: ["github-dark"],
        langs: [
            "javascript",
            "typescript",
            "python",
            "java",
            "csharp",
            "go",
            "rust",
            "cpp",
            "html",
            "css",
            "json",
            "plaintext",
        ],
    });

    cachedHighlighter = highlighter;
    return highlighter;
}
