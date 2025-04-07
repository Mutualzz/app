import { useTheme } from "../../contexts/ThemeManager";

interface StackProps extends React.HTMLProps<HTMLDivElement> {
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

export const Stack = ({
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
}: StackProps) => {
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
