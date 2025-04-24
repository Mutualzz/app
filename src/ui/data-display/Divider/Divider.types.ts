import type { ColorLike } from "@types";
import type { HTMLAttributes, ReactNode } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerInset = "none" | "start" | "end" | "context";

export type DividerLineColor =
    | "primary"
    | "neutral"
    | "danger"
    | "warning"
    | "info"
    | "success"
    | ColorLike;

export type DividerTextColor = "primary" | "neutral" | "accent" | ColorLike;

export type DividerVariant = "solid" | "dashed";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
    orientation?: DividerOrientation;
    inset?: DividerInset;

    lineColor?: DividerLineColor;
    textColor?: DividerTextColor;
    variant?: DividerVariant;

    children?: ReactNode;
}
