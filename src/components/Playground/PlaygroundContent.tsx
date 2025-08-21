import { Paper, useTheme, type PaperProps } from "@mutualzz/ui";
import { motion } from "motion/react";

const AnimatedPaper = motion.create(Paper);

export const PlaygroundContent = ({
    children,
    color,
    ...props
}: PaperProps) => {
    const { theme } = useTheme();

    return (
        <AnimatedPaper
            borderLeft={`1px solid ${theme.colors.success}`}
            borderRight={`1px solid ${theme.colors.success}`}
            color={color as string}
            overflowY="auto"
            p={20}
            width="100%"
            initial={{
                opacity: 0,
                scale: 0.95,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            {...(props as any)}
        >
            {children}
        </AnimatedPaper>
    );
};
