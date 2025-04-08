import { type Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { type LoaderProps } from "./Loader.types";

const sizeStyles = {
    xs: "1rem",
    sm: "1.5rem",
    md: "2rem",
    lg: "2.5rem",
    xl: "3rem",
};

const colorStyles = ({ colors }: Theme) => ({
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
});

export const Loader = styled.div<LoaderProps>`
    width: ${({ size = "md" }) => sizeStyles[size]};
    background-color: transparent;
    height: ${({ size = "md" }) => sizeStyles[size]};

    aspect-ratio: 1;
    border-radius: 50%;
    border: 2px solid;

    border-color: ${({ color = "secondary", variant = "text", theme }) =>
        variant === "contained"
            ? `${colorStyles(theme)[color].hex()} transparent`
            : `${colorStyles(theme)[color].lighten(1).hex()} transparent`};

    animation: l1 1s infinite;

    @keyframes l1 {
        to {
            transform: rotate(0.5turn);
        }
    }
`;
