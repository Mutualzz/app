import type { Theme } from "@emotion/react";
import type { Themes } from "@themes/index";

export const sortThemes = (themes: Theme[]): Theme[] => {
    const priorityOrder: Themes[] = ["baseDark", "baseLight"];

    return [
        ...themes.filter((theme) => priorityOrder.includes(theme.id as Themes)),
        ...themes.filter(
            (theme) => !priorityOrder.includes(theme.id as Themes),
        ),
    ];
};
