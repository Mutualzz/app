import { Markdown } from "@components/Markdown/Markdown";
import { createFileRoute } from "@tanstack/react-router";
import { Paper, Stack, Typography } from "@ui/index";
import { seo } from "seo";

export const Route = createFileRoute("/ui/markdown")({
    component: RouteComponent,
    head: () => ({
        meta: [
            ...seo({
                title: "Markdown Input - Mutualzz UI",
            }),
        ],
    }),
});

function RouteComponent() {
    return (
        <Paper direction="column" pt={8} width="100%" gap={2}>
            <Typography color="danger" level="display-xs" textAlign="center">
                This markdown editor is experimental and not fully functional
                yet.
            </Typography>
            <Stack height="100%" p={12}>
                <Markdown />
            </Stack>
        </Paper>
    );
}
