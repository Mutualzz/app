import type { ColorLike } from "@mutualzz/ui/types";

export type CircularProgressVariant = "plain" | "outlined" | "soft" | "solid";
export type CircularProgressSize = "sm" | "md" | "lg" | number;

export type CircularProgressColor =
    | "primary"
    | "neutral"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | ColorLike;

export type CircularProgressThickness = "sm" | "md" | "lg" | number;

export interface CircularProgressProps {
    size?: CircularProgressSize;
    variant?: CircularProgressVariant;
    color?: CircularProgressColor;
    determinate?: boolean;
    value?: number;
}
