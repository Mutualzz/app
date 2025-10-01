import { dynamicElevation, formatColor, styled } from "@mutualzz/ui-core";
import { Typography } from "@mutualzz/ui-web";
import { useState, type PropsWithChildren } from "react";

const SpoilerWrapper = styled(Typography)<{ revealed: boolean }>(
    ({ theme, revealed }) => ({
        display: "inline-block",
        borderRadius: 4,
        paddingInline: 1,
        fontSize: "inherit",

        backgroundColor: revealed
            ? dynamicElevation(theme.colors.surface, 5)
            : theme.typography.colors.muted,
        color: revealed ? "inherit" : "transparent",
        cursor: revealed ? "text" : "pointer",
        userSelect: revealed ? "text" : "none",
        transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
        outline: "none",

        "& img": {
            opacity: revealed ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
        },

        "&:hover": {
            backgroundColor: !revealed
                ? formatColor(theme.typography.colors.muted, {
                      format: "hexa",
                      darken: 10,
                  })
                : undefined,
        },
    }),
);

const Spoiler = ({ children }: PropsWithChildren) => {
    const [revealed, setRevealed] = useState(false);

    return (
        <SpoilerWrapper revealed={revealed} onClick={() => setRevealed(true)}>
            {children}
        </SpoilerWrapper>
    );
};

export { Spoiler };
