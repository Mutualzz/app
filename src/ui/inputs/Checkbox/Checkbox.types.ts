import type { ColorLike } from "@types";
import type { HTMLAttributes, ReactNode } from "react";

export type CheckboxColor =
    | "primary"
    | "neutral"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | ColorLike;

export type CheckboxVariant = "plain" | "outlined" | "soft" | "solid";

export type CheckboxSize = "sm" | "md" | "lg" | number;

export interface CheckboxProps extends HTMLAttributes<HTMLInputElement> {
    label?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;

    indeterminate?: boolean;

    checkedIcon?: ReactNode;
    uncheckedIcon?: ReactNode;
    indeterminateIcon?: ReactNode;

    color?: CheckboxColor;
    size?: CheckboxSize;
    variant?: CheckboxVariant;
}
