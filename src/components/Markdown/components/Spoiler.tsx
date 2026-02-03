import { useState, type PropsWithChildren } from "react";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";

export const Spoiler = ({ children }: PropsWithChildren) => {
    const app = useAppStore();
    const [revealed, setRevealed] = useState(false);
    const [hovered, setHovered] = useState(false);

    const prefersEmbossed = app.settings?.preferEmbossed;

    return (
        <Paper
            display="inline-block"
            borderRadius={4}
            paddingX={0.25}
            fontSize="inherit"
            variant={revealed ? "elevation" : "plain"}
            elevation={revealed ? 0 : hovered ? (prefersEmbossed ? 3 : 1) : 5}
            textColor={revealed ? "inherit" : "transparent"}
            css={{
                cursor: revealed ? "text" : "pointer",
                userSelect: revealed ? "text" : "none",
                transition:
                    "background-color 0.2s ease-in-out, color 0.2s ease-in-out",

                "& img": {
                    opacity: revealed ? 1 : 0,
                    transition: "opacity 0.2s ease-in-out",
                },

                "& > *": {
                    opacity: revealed ? 1 : 0,
                    pointerEvents: revealed ? "auto" : "none",
                },
            }}
            onClick={() => setRevealed(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
        </Paper>
    );
};
