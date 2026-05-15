import { Paper } from "@components/Paper";
import type { JSX } from "@emotion/react/jsx-runtime";
import { type ColorLike } from "@mutualzz/ui-core";
import { Box, Typography, useTheme } from "@mutualzz/ui-web";
import { reactNodeToHtml } from "@utils/index";
import { loadHighlighter } from "@utils/loadHighlighter";
import { useEffect, useState, type PropsWithChildren } from "react";
import { type BundledLanguage } from "shiki";

const KNOWN_LANGUAGES = [
    "javascript",
    "js",
    "typescript",
    "ts",
    "python",
    "py",
    "java",
    "csharp",
    "go",
    "rust",
    "cpp",
    "html",
    "css",
    "json",
    "plaintext",
];

interface CodeBlockProps extends PropsWithChildren {
    className?: string;
    inline?: boolean;
}

export const CodeBlock = ({ children, className, inline }: CodeBlockProps) => {
    const { theme } = useTheme();
    const [tokens, setTokens] = useState<JSX.Element[] | null>(null);
    const [code, setCode] = useState<string>("");
    const [language, setLanguage] = useState<BundledLanguage | "plaintext">(
        "plaintext",
    );

    useEffect(() => {
        if (!children && !className) return;

        if (!children && className) {
            const langOrText = className.replace(
                /language-/,
                "",
            ) as BundledLanguage;
            if (!langOrText) return;

            if (KNOWN_LANGUAGES.includes(langOrText)) setLanguage(langOrText);
            else setCode(langOrText.replaceAll("```", ""));

            return;
        }

        if (children && !className) {
            const text = reactNodeToHtml(children).replaceAll("```", "");

            setCode(text);
            return;
        }

        const lang = className?.replace(/language-/, "") as BundledLanguage;
        if (KNOWN_LANGUAGES.includes(lang)) setLanguage(lang);

        setCode(reactNodeToHtml(children).replaceAll("```", ""));
    }, [children, className]);

    useEffect(() => {
        (async () => {
            const highlighter = await loadHighlighter();
            const lines = highlighter.codeToTokens(code, {
                lang: language,
                theme: "github-dark",
            });

            const jsxLines = lines.tokens.map((line, i) => (
                <Box key={i}>
                    {line.map((token, j) => (
                        <Typography
                            key={j}
                            color={
                                (token.color as ColorLike) ??
                                theme.typography.colors.primary
                            }
                            variant="plain"
                        >
                            {token.content}
                        </Typography>
                    ))}
                </Box>
            ));

            setTokens(jsxLines);
        })();
    }, [code, language]);

    if (inline)
        return (
            <Paper
                px="0.25em"
                display="inline"
                elevation={3}
                variant="elevation"
            >
                {code}
            </Paper>
        );

    return (
        <Paper
            px="0.5rem"
            variant="elevation"
            color="primary"
            elevation={3}
            fontFamily="monospace"
        >
            <code>{tokens ?? code}</code>
        </Paper>
    );
};
