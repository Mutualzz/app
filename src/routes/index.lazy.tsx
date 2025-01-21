import Stack from "@mui/material/Stack";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
    component: Index,
});

function Index() {
    return (
        <Stack className="p-2">
            <h3>Welcome Home!</h3>
        </Stack>
    );
}
