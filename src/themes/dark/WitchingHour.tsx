import type { Theme } from "@ui/types";

import { baseDarkTheme } from "@ui/themes/baseDark";

export const witchingHourTheme: Theme = {
    ...baseDarkTheme,
    id: "witchingHour",
    name: "Witching Hour",
    description: "Mystical, Arcane, and Enigmatic",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#4F3C7E",
        neutral: "#2A4B76",
        background: "#0A0A12",
        surface: "#151526",
        danger: "#AD1457",
        warning: "#D4A033",
        info: "#60C297",
        success: "#6FD36F",
    },
};
