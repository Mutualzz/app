import {
    type IconButtonProps,
    IconButton as MzIconButton,
    useTheme,
} from "@mutualzz/ui-web";

export const IconButton = ({ color, variant, ...props }: IconButtonProps) => {
    const { theme } = useTheme();
    return (
        <MzIconButton
            color={color ?? theme.typography.colors.primary}
            variant={variant ?? "plain"}
            {...props}
        />
    );
};
