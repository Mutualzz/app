import { css, type Theme } from "@emotion/react";

import { darken, dynamicElevation } from "@mutualzz/ui";
import { formatHex8 } from "culori";

export const spoilerStyles = (revealed: boolean, theme: Theme) =>
    css({
        display: "inline-block",
        borderRadius: 4,
        paddingInline: 1,
        fontSize: "inherit",

        backgroundColor: revealed
            ? dynamicElevation(theme.colors.surface, 5)
            : theme.typography.colors.disabled,
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
                ? formatHex8(darken(theme.typography.colors.disabled, 0.1))
                : undefined,
        },
    });
