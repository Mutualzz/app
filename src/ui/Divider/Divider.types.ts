import type { HTMLAttributes, ReactNode } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerInset = "none" | "start" | "end" | "context";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
    orientation?: DividerOrientation;
    inset?: "none" | "start" | "end" | "context";

    children?: ReactNode;
}
