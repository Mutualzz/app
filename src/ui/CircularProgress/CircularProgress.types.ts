import type { HTMLProps } from "react";

export type CircularProgressVariant = "plain" | "outlined" | "soft" | "solid";
export type CircularProgressSize = "sm" | "md" | "lg";
export type CircularProgressColor =
    | "primary"
    | "neutral"
    | "success"
    | "error"
    | "warning"
    | "info";

export type CircularProgressThickness = "thin" | "medium" | "thick";

export type CircularProgressProps = HTMLProps<SVGElement> & {
    size?: CircularProgressSize;
    variant?: CircularProgressVariant;
    color?: CircularProgressColor;
    thickness?: CircularProgressThickness;
    determinate?: boolean;
    value?: number;
};
