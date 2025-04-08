import { type ButtonHTMLAttributes } from "react";

export type ButtonColor =
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info";

export type ButtonVariant = "contained" | "outlined" | "text" | "subtle";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}
