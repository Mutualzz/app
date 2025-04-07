import type { HTMLProps } from "react";

export interface StackProps extends HTMLProps<HTMLDivElement> {
    display?: "flex" | "block" | "inline-block" | "grid";
    direction?: "row" | "column";
    wrap?: "nowrap" | "wrap" | "wrap-reverse";
    justifyContent?:
        | "flex-start"
        | "flex-end"
        | "center"
        | "space-between"
        | "space-around"
        | "space-evenly";
    alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    alignContent?:
        | "flex-start"
        | "flex-end"
        | "center"
        | "space-between"
        | "space-around"
        | "stretch";
    gap?: string | number;
    padding?: string | number;

    // These props apply only when its a child element of a flex container
    order?: number;
    grow?: number;
    shrink?: number;
    basis?: number;
    flex?: string | number;
    alignSelf?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";

    // Neccessary
    className?: string;
    children: React.ReactNode;
}
