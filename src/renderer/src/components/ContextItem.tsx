import { Item, type ItemProps } from "@mutualzz/contexify";
import { useTheme } from "@mutualzz/ui-web";

export const ContextItem = ({ textColor, color, ...props }: ItemProps) => {
    const { theme } = useTheme();

    const resolvedTextColor =
        textColor ??
        (color == null ? theme.typography.colors.primary : undefined);

    return (
        <Item
            variant="plain"
            color={color}
            textColor={resolvedTextColor}
            horizontalAlign="left"
            {...props}
        />
    );
};
