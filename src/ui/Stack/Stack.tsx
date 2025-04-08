import { type FC } from "react";
import { type StackProps } from "./Stack.types";

export const Stack: FC<StackProps> = ({
    display = "flex",
    direction = "row",
    wrap = "nowrap",
    justifyContent = "flex-start",
    alignItems = "stretch",
    alignContent = "flex-start",
    gap = 0,
    padding = 0,
    order,
    grow,
    shrink,
    basis,
    flex,
    alignSelf,
    children,
    ...props
}) => {
    return (
        <div
            css={{
                background: "transparent",
                display,
                flexDirection: direction,
                justifyContent,
                alignItems,
                alignContent,
                flexWrap: wrap,
                gap,
                padding,
                order,
                flexGrow: grow,
                flexShrink: shrink,
                flexBasis: basis,
                flex,
                alignSelf,
            }}
            {...props}
        >
            {children}
        </div>
    );
};
