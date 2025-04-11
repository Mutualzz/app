import type { CSSObject, Theme } from "@emotion/react";
import { Global } from "@emotion/react";
import { useTheme } from "../contexts/ThemeManager";

const neededStyle = ({ colors, typography }: Theme): CSSObject => ({
    overflowX: "hidden",
    boxSizing: "border-box",
    height: "100dvh",
    "-moz-box-sizing": "border-box",
    "-webkit-box-sizing": "border-box",

    // Theme based styles
    backgroundColor: colors.background,
    color: colors.typography.primary,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
});

export const GlobalStyles = () => {
    const { theme } = useTheme();

    return (
        <Global
            styles={{
                "*": {
                    minWidth: 0,
                    margin: 0,
                    padding: 0,
                    boxSizing: "border-box",
                },
                ":root": neededStyle(theme),
            }}
        />
    );
};
