export type LinearProgressVariant = "plain" | "outlined" | "soft" | "solid";
export type LinearProgressSize = "sm" | "md" | "lg";
export type LinearProgressColor =
    | "primary"
    | "neutral"
    | "success"
    | "error"
    | "warning"
    | "info";

export interface LinearProgressProps {
    size?: LinearProgressSize;
    variant?: LinearProgressVariant;
    color?: LinearProgressColor;
    determinate?: boolean;
    value?: number;
}
