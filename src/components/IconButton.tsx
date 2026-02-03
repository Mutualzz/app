import {
    type IconButtonProps,
    IconButton as MzIconButton,
    useTheme,
} from "@mutualzz/ui-web";

export const IconButton = ({ color, ...props }: IconButtonProps) => {
    const { theme } = useTheme();
    return (
        <MzIconButton
            color={color ?? theme.typography.colors.primary}
            {...props}
        />
    );
};
