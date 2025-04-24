import { useTheme } from "@hooks/useTheme";
import { dynamicElevation } from "@utils/dynamicElevation";
import type { FC } from "react";
import type { PaperProps } from "./Paper.types";

export const Paper: FC<PaperProps> = ({
    display = "flex",
    direction,
    wrap,
    justifyContent,
    alignItems,
    alignContent,
    gap,
    padding,
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
    elevation = 0,
    children,
    ...props
}) => {
    if (elevation < 0 || elevation > 4)
        throw new Error("Elevation must be between 0 and 4");
    const { theme } = useTheme();

    return (
        <div
            css={{
                backgroundColor: dynamicElevation(
                    theme.colors.surface,
                    elevation,
                ),
                boxShadow: `0 ${elevation + 1}px ${elevation * 2}px rgba(0,0,0,${elevation * 0.1})`,
                borderRadius: "0.75rem",
                transition: "all 0.2 ease",
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
                marginBlock: marginY,
                marginInline: marginX,
            }}
            {...props}
        >
            {children}
        </div>
    );
};
