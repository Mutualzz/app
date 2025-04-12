import type { ColorLike, CSSResponsiveValue } from "@mutualzz/theme";

export type CircularProgressVariant = "plain" | "outlined" | "soft" | "solid";
export type CircularProgressSize =
    | "sm"
    | "md"
    | "lg"
    | CSSResponsiveValue
    | number;

export type CircularProgressColor =
    | "primary"
    | "neutral"
    | "success"
    | "error"
    | "warning"
    | "info"
    | ColorLike;

export interface CircularProgressProps {
    size?: CircularProgressSize;
    variant?: CircularProgressVariant;
    color?: CircularProgressColor;
    determinate?: boolean;
    value?: number;
}
