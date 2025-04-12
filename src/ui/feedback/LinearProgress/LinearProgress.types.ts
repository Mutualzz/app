import type { ColorLike, CSSResponsiveValue } from "@mutualzz/theme";

export type LinearProgressVariant = "plain" | "outlined" | "soft" | "solid";

export type LinearProgressLength =
    | "sm"
    | "md"
    | "lg"
    | CSSResponsiveValue
    | number;

export type LinearProgressThickness =
    | "sm"
    | "md"
    | "lg"
    | CSSResponsiveValue
    | number;

export type LinearProgressColor =
    | "primary"
    | "neutral"
    | "success"
    | "error"
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
