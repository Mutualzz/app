import type { ColorLike } from "@mutualzz/ui/types";

export type LinearProgressVariant = "plain" | "outlined" | "soft" | "solid";

export type LinearProgressLength = "sm" | "md" | "lg" | number;

export type LinearProgressThickness = "sm" | "md" | "lg" | number;

export type LinearProgressColor =
    | "primary"
    | "neutral"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | ColorLike;

export type LinearProgressAnimation =
    | "slide"
    | "wave"
    | "bounce"
    | "scale-in-out";

export interface LinearProgressProps {
    length?: LinearProgressLength;
    thickness?: LinearProgressThickness;
    variant?: LinearProgressVariant;
    color?: LinearProgressColor;
    animation?: LinearProgressAnimation;
    determinate?: boolean;
    value?: number;
}
