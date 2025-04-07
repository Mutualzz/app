import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "../ui/Button/Button";
import { Stack } from "../ui/Stack/Stack";

export const Route = createLazyFileRoute("/")({
    component: Index,
});

function Index() {
    const navigate = useNavigate();

    return (
        <Stack direction="column">
            <Button
                onClick={() => {
                    navigate({
                        to: "/playground",
                    });
                }}
                size="lg"
            >
                Go to the UI playground
            </Button>
        </Stack>
    );
}
