import type { HTMLProps, ReactNode } from "react";

export type SelectColor =
    | "primary"
    | "neutral"
    | "success"
    | "error"
    | "warning"
    | "info";
export type SelectVariant = "solid" | "outlined" | "soft" | "plain";
export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps
    extends Omit<HTMLProps<HTMLSelectElement>, "size"> {
    color?: SelectColor;
    variant?: SelectVariant;
    size?: SelectSize;
    placeholder?: string;
    disabled?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    indicator?: ReactNode;
}
