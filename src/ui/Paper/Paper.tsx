import type { FC } from "react";
import { useTheme } from "../../contexts/ThemeManager";
import { dynamicElevation } from "../../utils";
import type { StackProps } from "../Stack/Stack.types";
import type { PaperProps } from "./Paper.types";

export const Paper: FC<StackProps & PaperProps> = ({
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
            }}
            {...props}
        >
            {children}
        </div>
    );
};
