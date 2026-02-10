import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { useMemo, useState, type PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    spoiler?: boolean;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    maxWidth?: string | number;
}>;

export const MessageEmbedSpoiler = ({
    spoiler,
    children,
    width,
    height,
    borderRadius,
    maxWidth,
}: Props) => {
    const app = useAppStore();
    const [revealed, setRevealed] = useState(false);
    const [hovered, setHovered] = useState(false);

    const prefersEmbossed = useMemo(
        () => app.settings?.preferEmbossed,
        [app.settings?.preferEmbossed],
    );

    if (!spoiler) return children;

    return (
        <Paper
            display="inline-block"
            borderRadius={borderRadius ?? 8}
            fontSize="inherit"
            variant="plain"
            width={width}
            maxWidth={maxWidth}
            height={height}
            padding={0}
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
