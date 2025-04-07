import { type FC } from "react";
import { useTheme } from "../../contexts/ThemeManager";
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
    className,
    children,
}) => {
    const { theme } = useTheme();

    return (
        <div
            css={{
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
                backgroundColor: theme.colors.background,
                color: theme.colors.typography.primary,
            }}
            className={className}
        >
            {children}
        </div>
    );
};
