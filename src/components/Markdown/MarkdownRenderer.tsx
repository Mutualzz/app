import { Paper, Typography, useTheme } from "@mutualzz/ui";

import { Markdown } from "./Markdown";
import type { MarkdownRendererProps } from "./Markdown.types";

export const MarkdownRenderer = ({
    color = "neutral",
    textColor = "primary",
    variant = "outlined",
    value,
}: MarkdownRendererProps) => {
    const { theme } = useTheme();

    return (
        <Paper
            color={color}
            textColor={textColor}
            variant={variant}
            display="block"
            height="100%"
            p={12}
            mt={10}
        >
            <Markdown
                components={{
                    h1: ({ children }) => (
                        <Typography
                            level="h3"
                            fontWeight="bold"
                            display="block"
                        >
                            {children}
                        </Typography>
                    ),

                    h2: ({ children }) => (
                        <Typography
                            level="h4"
                            fontWeight="bold"
                            display="block"
                        >
                            {children}
                        </Typography>
                    ),

                    h3: ({ children }) => (
                        <Typography
                            level="h5"
                            fontWeight="bold"
                            display="block"
                        >
                            {children}
                        </Typography>
                    ),

                    p: ({ children }) => (
                        <Typography
                            whiteSpace="break-spaces"
                            fontSize="inherit"
                            display="inline"
                        >
                            {children}
                        </Typography>
                    ),

                    blockquote: ({ children }) => (
                        <blockquote
                            css={{
                                display: "block",
                                margin: 0,
                                paddingLeft: "0.5em",
                                borderLeft: `4px solid ${theme.typography.colors.disabled}`,
                                color: theme.typography.colors.primary,
                            }}
                        >
                            {children}
                        </blockquote>
                    ),

                    strong: ({ children }) => (
                        <Typography
                            whiteSpace="pre-wrap"
                            fontSize="inherit"
                            fontWeight="bold"
                        >
                            {children}
                        </Typography>
                    ),

                    em: ({ children }) => (
                        <Typography
                            whiteSpace="pre-wrap"
                            fontSize="inherit"
                            fontStyle="italic"
                        >
                            {children}
                        </Typography>
                    ),

                    // strikethrough: ({ children }) => (
                    //     <Typography
                    //         fontSize="inherit"
                    //         textDecoration="line-through"
                    //     >
                    //         {children}
                    //     </Typography>
                    // ),

                    u: ({ children }) => {
                        console.log(`"${children}"`);
                        return (
                            <Typography
                                whiteSpace="pre-wrap"
                                fontSize="inherit"
                                textDecoration="underline"
                            >
                                {children}
                            </Typography>
                        );
                    },

                    code: ({ children }) => (
                        <Typography
                            fontFamily="monospace"
                            fontSize="inherit"
                            css={{
                                background: "rgba(255,255,255,0.05)",
                                padding: "0.2em 0.4em",
                                borderRadius: 4,
                            }}
                        >
                            {children}
                        </Typography>
                    ),

                    emoji: ({ name, url, unicode }) => (
                        <span
                            role="button"
                            aria-label={`:${name}:`}
                            contentEditable={false}
                            title={`:${name}:`}
                            css={{
                                display: "inline-block",
                                width: "1.375em",
                                height: "1.375em",
                                verticalAlign: "middle",
                            }}
                        >
                            <img
                                src={url}
                                alt={unicode}
                                draggable={false}
                                aria-label={`:${name}:`}
                                css={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </span>
                    ),

                    // spoiler: ({ children }) => {
                    //     const [revealed, setRevealed] = useState(false);

                    //     return (
                    //         <span
                    //             css={spoilerStyles(revealed, theme)}
                    //             onClick={() => {
                    //                 setRevealed(true);
                    //             }}
                    //         >
                    //             {children}
                    //         </span>
                    //     );
                    // },
                }}
            >
                {value}
            </Markdown>
        </Paper>
    );
};
