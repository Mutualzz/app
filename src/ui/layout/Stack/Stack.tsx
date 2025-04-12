import { type FC } from "react";
import { type StackProps } from "./Stack.types";

export const Stack: FC<StackProps> = ({
    display = "flex",
    position = "relative",
    top,
    right,
    bottom,
    left,
    width,
    height,
    direction,
    wrap,
    justifyContent,
    alignItems,
    alignContent,
    gap,
    padding,
    margin,
    order,
    grow,
    shrink,
    basis,
    flex,
    alignSelf,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingX,
    paddingY,
    marginX,
    marginY,
    children,
    ...props
}) => (
    <div
        css={{
            display,
            position,
            top,
            right,
            bottom,
            left,
            width,
            height,
            flexDirection: direction,
            justifyContent,
            alignItems,
            alignContent,
            flexWrap: wrap,
            gap,
            padding,
            margin,
            order,
            flexGrow: grow,
            flexShrink: shrink,
            flexBasis: basis,
            flex,
            alignSelf,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            marginTop,
            marginRight,
            marginBottom,
            marginLeft,
            paddingBlock: paddingY,
            paddingInline: paddingX,
        }}
        {...props}
    >
        {children}
    </div>
);
