import { Markdown } from "@components/Markdown/Markdown";
import { createFileRoute } from "@tanstack/react-router";
import { Paper, Stack, Typography } from "@ui/index";

export const Route = createFileRoute("/ui/markdown")({
    component: RouteComponent,
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
