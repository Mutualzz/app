import { MarkdownInput } from "@components/Markdown/MarkdownInput";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer";
import { createFileRoute } from "@tanstack/react-router";
import { Paper, Stack, Typography } from "@ui/index";
import { useState } from "react";

export const Route = createFileRoute("/ui/data-display/markdown-renderer")({
    component: RouteComponent,
});

function RouteComponent() {
    const [markdown, setMarkdown] = useState("");

    return (
        <Stack direction="row" width="100%" spacing={10}>
            <Paper width="100%" direction="column" pt={8}>
                <Typography level="title-sm" textAlign="center">
                    Markdown Editor
                </Typography>
                <Stack height="100%" p={12}>
                    <MarkdownInput
                        textColor="primary"
                        variant="outlined"
                        color="success"
                        value={markdown}
                        onChange={setMarkdown}
                    />
                </Stack>
            </Paper>
            <Paper direction="column" pt={8} width="100%">
                <Typography level="title-sm" textAlign="center">
                    Markdown Renderer
                </Typography>
                <Paper
                    variant="outlined"
                    textColor="primary"
                    display="block"
                    height="100%"
                    p={12}
                    mt={10}
                >
                    <MarkdownRenderer value={markdown} />
                </Paper>
            </Paper>
        </Stack>
    );
}
