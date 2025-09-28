import { useTheme } from "@mutualzz/ui-core";
import {
    Divider,
    Paper,
    Stack,
    Typography,
    type PaperProps,
} from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { motion } from "motion/react";

const AnimatedPaper = motion.create(Paper);

export const PlaygroundContent = ({
    children,
    color,
    ...props
}: PaperProps) => {
    const { theme } = useTheme();

    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media", ""),
    );

    return (
        <AnimatedPaper
            color={color as string}
            overflowY="auto"
            direction="column"
            p={20}
            width="100%"
            height="100%"
            initial={{
                opacity: 0,
                scale: 0.95,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
        >
            {isMobileQuery && (
                <>
                    <Typography
                        variant="none"
                        level={{
                            xs: "body-md",
                            sm: "body-lg",
                            md: "h6",
                            lg: "h5",
                        }}
                        fontSize={{
                            xs: "1rem",
                            sm: "1.1rem",
                            md: "1.25rem",
                            lg: "1.5rem",
                        }}
                        textAlign="center"
                        fontWeight={{ xs: 500, sm: 600 }}
                    >
                        Swipe from right to left to edit the component :3
                    </Typography>
                    <Divider />
                </>
            )}
            <Stack width="100%" height="100%" {...props}>
                {children}
            </Stack>
        </AnimatedPaper>
    );
};
