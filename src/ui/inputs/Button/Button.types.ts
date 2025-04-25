import type { ColorLike } from "@mutualzz/ui/types";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonColor =
    | "primary"
    | "neutral"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | ColorLike;

export type ButtonVariant = "plain" | "outlined" | "soft" | "solid";

export type ButtonSize = "sm" | "md" | "lg" | number;

export interface ButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    fullWidth?: boolean;
}
