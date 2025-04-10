import { type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonColor =
    | "primary"
    | "neutral"
    | "success"
    | "error"
    | "warning"
    | "info";

export type ButtonVariant = "plain" | "outlined" | "soft" | "solid";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
}
