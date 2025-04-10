import type { HTMLProps } from "react";

export type OptionColor =
    | "primary"
    | "neutral"
    | "success"
    | "error"
    | "warning"
    | "info";

export type OptionVariant = "solid" | "outlined" | "soft" | "plain";

export interface OptionProps extends HTMLProps<HTMLOptionElement> {
    value: string;
    color?: OptionColor;
    disabled?: boolean;
    label?: string;
    variant?: OptionVariant;
}
