import { Global } from "@emotion/react";
import { useTheme } from "@hooks/useTheme";

export const GlobalStyles = () => {
    const { theme } = useTheme();

    return (
        <Global
            styles={{
                "html, body, #app": {
                    height: "100%", // needed for flex containers
                    width: "100%",
                    margin: 0,
                    padding: 0,
                },
                body: {
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: theme.colors.background,
                    color: theme.colors.typography.primary,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.fontSize,
                    lineHeight: theme.typography.lineHeight,

                    transition:
                        "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease,fill 0.3s ease,stroke 0.3s ease",
                },
                "#app": {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh", // ensures full view height
                },
            }}
        />
    );
};
