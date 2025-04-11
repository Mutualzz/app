import type { FC } from "react";
import type { BoxProps } from "./Box.types";

export const Box: FC<BoxProps> = ({
    display = "block",
    position = "relative",
    top,
    right,
    bottom,
    left,
    width,
    height,
    padding,
    margin,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    children,
    ...props
}) => (
    <div
        {...props}
        css={{
            display,
            position,
            padding,
            margin,
            top,
            right,
            bottom,
            left,
            width,
            height,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            marginTop,
            marginRight,
            marginBottom,
            marginLeft,
        }}
    >
        {children}
    </div>
);
