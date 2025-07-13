import { Stack, Typography } from "@mutualzz/ui";
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
    return (
        <Stack
            width="100%"
            height="100%"
            justifyContent="center"
            mx="auto"
            my="auto"
        >
            <Typography variant="none" level="display-sm">
                Use buttons on the sidebar to navigate :3
            </Typography>
        </Stack>
    );
}
