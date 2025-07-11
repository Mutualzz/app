/* eslint-disable sonarjs/no-nested-functions */
import type { JSX } from "@emotion/react/jsx-runtime";
import { loadHighlighter } from "@utils/loadHighlighter";
import { useEffect, useState } from "react";
import type { CodeBlockProps } from "./CodeBlock.types";

export const CodeBlock = ({ code, language = "plaintext" }: CodeBlockProps) => {
    const [tokens, setTokens] = useState<JSX.Element[] | null>(null);

    useEffect(() => {
        (async () => {
            const highlighter = await loadHighlighter();
            const lines = highlighter.codeToTokens(code, {
                lang: language,
                theme: "github-dark",
            });

            const jsxLines = lines.tokens.map((line, i) => (
                <div key={i}>
                    {line.map((token, j) => (
                        <span key={j} style={{ color: token.color ?? "#fff" }}>
                            {token.content}
                        </span>
                    ))}
                </div>
            ));

            setTokens(jsxLines);
        })();
    }, [code, language]);

    return (
        <pre
            style={{
                background: "#0d1117",
                color: "#fff",
                padding: "1rem",
                borderRadius: 6,
                fontFamily: "monospace",
                fontSize: 14,
                overflowX: "auto",
            }}
        >
            <code>{tokens ?? code}</code>
        </pre>
    );
};
