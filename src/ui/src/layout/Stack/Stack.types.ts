import type { BoxProps } from "../Box/Box.types";

export interface StackProps extends Omit<BoxProps, "display"> {
    display?: "flex" | "grid";

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

    // These props apply only when its a child element of a flex container
    order?: number;
    grow?: number;
    shrink?: number;
    basis?: number;
    flex?: string | number;
    alignSelf?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
}
