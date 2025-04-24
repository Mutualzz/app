import { css, Global } from "@emotion/react";
import { useTheme } from "@hooks/useTheme";

export const GlobalStyles = () => {
    const { theme } = useTheme();

    return (
        <Global
            styles={css`
                *,
                *::before,
                *::after {
                    box-sizing: border-box;
                }

                html,
                body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;

                    font-family: ${theme.typography.fontFamily};
                    font-size: ${theme.typography.fontSize};
                    line-height: ${theme.typography.lineHeight};
                    background-color: ${theme.colors.background};
                    color: ${theme.colors.typography.primary};

                    transition:
                        background-color 0.3s ease,
                        color 0.3s ease,
                        border-color 0.3s ease,
                        fill 0.3s ease,
                        stroke 0.3s ease;
                }

                #app {
                    min-height: 100vh;
                    width: 100%;
                    box-sizing: border-box;
                }

                p {
                    margin: 0;
                    line-height: ${theme.typography.lineHeight};
                }

                ul,
                ol {
                    padding: 0;
                    margin: 0;
                    list-style: none;
                }

                img,
                video,
                svg {
                    max-width: 100%;
                    height: auto;
                    display: block;
                }
            `}
        />
    );
};
