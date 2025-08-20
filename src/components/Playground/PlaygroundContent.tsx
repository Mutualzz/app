import { Paper, useTheme, type PaperProps } from "@mutualzz/ui";

export const PlaygroundContent = ({
    children,
    color,
    ...props
}: PaperProps) => {
    const { theme } = useTheme();

    return (
        <Paper
            borderLeft={`1px solid ${theme.colors.success}`}
            borderRight={`1px solid ${theme.colors.success}`}
            color={color as string}
            overflowY="auto"
            p={20}
            width="100%"
            {...props}
        >
            {children}
        </Paper>
    );
};
