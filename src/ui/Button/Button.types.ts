import { type ButtonHTMLAttributes } from "react";

export type ButtonColor =
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info";

export type ButtonVariant = "contained" | "outlined" | "text" | "subtle";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}
