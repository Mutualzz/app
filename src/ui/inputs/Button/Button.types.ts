import type { ColorLike } from "@mutualzz/theme";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonColor =
    | "primary"
    | "neutral"
    | "success"
    | "error"
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
}

export interface ButtonDefaultsInterface {
    minSize: number;
    maxSize: number;
    defaultSize: ButtonSize;
    defaultColor: ButtonColor;
    defaultVariant: ButtonVariant;
}
