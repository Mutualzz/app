export type LinearProgressVariant = "plain" | "outlined" | "soft" | "solid";
export type LinearProgressSize = "sm" | "md" | "lg";
export type LinearProgressColor =
    | "primary"
    | "neutral"
    | "success"
    | "error"
    | "warning"
    | "info";

export type LinearProgressAnimation =
    | "slide"
    | "wave"
    | "bounce"
    | "scale-in-out";

export interface LinearProgressProps {
    size?: LinearProgressSize;
    variant?: LinearProgressVariant;
    color?: LinearProgressColor;
    animation?: LinearProgressAnimation;
    determinate?: boolean;
    value?: number;
}
