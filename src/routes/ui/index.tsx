import { Stack, Typography, useTheme } from "@mutualzz/ui";
import { useMediaQuery } from "@react-hookz/web";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ui/")({
    component: PlaygroundIndexComponent,
    head: () => ({
        meta: [
            ...seo({
                title: "Mutualzz UI",
            }),
        ],
    }),
});

function PlaygroundIndexComponent() {
    const { theme } = useTheme();

    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media", ""),
    );

    return (
        <Stack
            width={{ xs: "100%", sm: "90%", md: "70%", lg: "50%", xl: "40%" }}
            height="100%"
            justifyContent="center"
            alignItems="center"
            direction="column"
            mx="auto"
            my="auto"
            spacing={10}
            px={{ xs: "1rem", sm: "2rem", md: "3rem" }}
            py={{ xs: "1rem", sm: "2rem", md: "3rem" }}
        >
            {isMobileQuery ? (
                <Typography
                    variant="none"
                    level={{ xs: "h5", sm: "h4", md: "h3", lg: "h2" }}
                    fontSize={{
                        xs: "1.25rem",
                        sm: "1.5rem",
                        md: "2rem",
                        lg: "2.5rem",
                    }}
                    textAlign="center"
                    fontWeight={{ xs: 600, sm: 700 }}
                >
                    Swipe from the left sidebar to navigate and then use the
                    buttons on the sidebar to navigate :3
                </Typography>
            ) : (
                <Typography
                    variant="none"
                    level={{ xs: "h5", sm: "h4", md: "h3", lg: "h2" }}
                    fontSize={{
                        xs: "1.25rem",
                        sm: "1.5rem",
                        md: "2rem",
                        lg: "2.5rem",
                    }}
                    textAlign="center"
                    fontWeight={{ xs: 600, sm: 700 }}
                >
                    Use the buttons on the sidebar to navigate :3
                </Typography>
            )}
        </Stack>
    );
}
