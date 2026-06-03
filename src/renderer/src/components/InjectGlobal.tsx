import { css, Global } from "@emotion/react";
import { useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { dynamicElevation, formatColor } from "@mutualzz/ui-core";
import { useAppStore } from "@hooks/useStores";

export const InjectGlobal = observer(() => {
    const { theme } = useTheme();
    const app = useAppStore();

    const toastBackground = dynamicElevation(
        theme.colors.surface,
        app.settings?.preferEmbossed ? 5 : 1
    );
    const toastText = theme.typography.colors.primary;
    const toastBorder = formatColor(theme.colors.neutral, {
        lighten: 35,
        format: "hexa"
    });

    return (
        <Global
            styles={css`
                p {
                    padding-inline-start: 0 !important;
                    padding-inline-end: 0 !important;
                    margin: 0;
                }

                ul,
                menu,
                dir {
                    display: block;
                    list-style-type: disc;
                    margin-block-start: 0 !important;
                    margin-block-end: 0 !important;
                    padding-inline-start: ${theme.spacing(6)} !important;
                }

                ol {
                    display: block;
                    list-style-type: decimal;
                    margin-block-start: 0 !important;
                    margin-block-end: 0 !important;
                    padding-inline-start: ${theme.spacing(6)} !important;
                }

                .Toastify__toast-container {
                    z-index: 9999;
                }

                .Toastify__toast {
                    border-radius: 12px;
                    box-shadow: 0 10px 30px
                        ${formatColor(theme.colors.primary, {
                            darken: 70,
                            format: "hexa"
                        })};
                    border: 1px solid ${toastBorder};
                    font-family: ${theme.typography.fontFamily};
                    color: ${toastText};
                    overflow: hidden;
                }

                .Toastify__toast-theme--dark {
                    background: ${toastBackground};
                    color: ${toastText};
                }

                .Toastify__toast-theme--light {
                    background: ${toastBackground};
                    color: ${toastText};
                }

                .Toastify__toast-theme--colored.Toastify__toast--default {
                    background: ${toastBackground};
                    color: ${toastText};
                }

                .Toastify__toast-theme--colored.Toastify__toast--info {
                    background: ${theme.colors.info};
                    color: ${theme.typography.colors.primary};
                }

                .Toastify__toast-theme--colored.Toastify__toast--success {
                    background: ${theme.colors.success};
                    color: ${theme.typography.colors.primary};
                }

                .Toastify__toast-theme--colored.Toastify__toast--warning {
                    background: ${theme.colors.warning};
                    color: ${theme.typography.colors.primary};
                }

                .Toastify__toast-theme--colored.Toastify__toast--error {
                    background: ${theme.colors.danger};
                    color: ${theme.typography.colors.primary};
                }

                .Toastify__toast-icon {
                    margin-inline-end: 10px;
                }

                .Toastify__progress-bar {
                    height: 3px;
                }

                .Toastify__progress-bar-theme--light {
                    background: ${theme.colors.primary};
                }

                .Toastify__progress-bar-theme--dark {
                    background: ${theme.colors.primary};
                }

                .Toastify__progress-bar-theme--colored.Toastify__progress-bar--info,
                .Toastify__progress-bar-theme--colored.Toastify__progress-bar--success,
                .Toastify__progress-bar-theme--colored.Toastify__progress-bar--warning,
                .Toastify__progress-bar-theme--colored.Toastify__progress-bar--error {
                    background: ${theme.colors.primary};
                }

                .Toastify__close-button {
                    color: ${toastText};
                    opacity: 0.75;
                }

                .Toastify__close-button--default {
                    color: ${toastText};
                }

                .Toastify__close-button > svg {
                    fill: currentColor;
                }

                .Toastify__close-button:hover,
                .Toastify__close-button:focus {
                    opacity: 1;
                }

                @keyframes typingDot {
                    0%,
                    60%,
                    100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-3px);
                        opacity: 1;
                    }
                }
            `}
        />
    );
});
