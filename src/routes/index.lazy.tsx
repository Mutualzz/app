import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import { useTheme } from "../contexts/ThemeManager";
import { Button, ButtonColor, ButtonVariant } from "../ui/Button/Button";
import { Stack } from "../ui/Stack/Stack";

import chunk from "lodash/chunk";
import { AllThemes } from "../themes";

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
                        to: "/playgroud",
                    });
                }}
                size="lg"
            >
                Go to the UI playground
            </Button>
        </Stack>
    );
}
