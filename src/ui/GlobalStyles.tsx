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
                },
                body: {
                    backgroundColor: theme.colors.background.hex(),
                    color: theme.colors.typography.primary.hex(),
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.fontSize,
                    lineHeight: theme.typography.lineHeight,
                },
            }}
        />
    );
};
