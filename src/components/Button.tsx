import {
    type ButtonProps,
    Button as MzButton,
    useTheme,
} from "@mutualzz/ui-web";

export const Button = ({ color, ...props }: ButtonProps) => {
    const { theme } = useTheme();
    return (
        <MzButton color={color ?? theme.typography.colors.primary} {...props} />
    );
};
