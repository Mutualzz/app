import type { HTMLProps } from "react";

export type BoxProps = HTMLProps<HTMLDivElement> & {
    display?: "block" | "inline-block";
    position?: "absolute" | "relative" | "fixed" | "sticky" | "static";
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
    width?: string | number;
    height?: string | number;

    padding?: string | number;
    margin?: string | number;

    paddingTop?: string | number;
    paddingRight?: string | number;
    paddingBottom?: string | number;
    paddingLeft?: string | number;

    marginTop?: string | number;
    marginRight?: string | number;
    marginBottom?: string | number;
    marginLeft?: string | number;
};
