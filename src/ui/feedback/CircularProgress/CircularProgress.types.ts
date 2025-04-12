import type { ColorLike } from "@mutualzz/theme";

export type CircularProgressVariant = "plain" | "outlined" | "soft" | "solid";
export type CircularProgressSize = "sm" | "md" | "lg" | number;

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

export interface CircularProgressDefaultsInterface {
    minSize: number;
    maxSize: number;
    defaultSize: CircularProgressSize;
    defaultColor: CircularProgressColor;
    defaultVariant: CircularProgressVariant;
    defaultDeterminate: boolean;
    defaultValue: number;
}
