import { Global } from "@emotion/react";
import { useTheme } from "../contexts/ThemeManager";

export const GlobalStyles = () => {
    const { theme } = useTheme();

    return (
        <Global
            styles={{
                "*": {
                    margin: 0,
                    padding: 0,
                    boxSizing: "border-box",
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.fontSize,
                    lineHeight: theme.typography.lineHeight,
                    color: theme.colors.typography.primary.hex(),
                    backgroundColor: theme.colors.background.hex(),
                },
            }}
        />
    );
};
