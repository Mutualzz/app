import { useAppStore } from "@hooks/useAppStore";
import { Button, Stack, Typography } from "@mutualzz/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createFileRoute("/")({
    component: observer(Index),
});

function Index() {
    const app = useAppStore();
    const { account } = app;
    const navigate = useNavigate();

    return (
        <Stack
            direction="column"
            height="100vh"
            justifyContent="center"
            alignItems="center"
        >
            <img css={{ width: 128, height: 128 }} src="/logo.png" alt="Logo" />
            <Typography level="h2">
                Website is currently under heavy development
            </Typography>
            <Typography level="h4">
                The UI is being made from scratch
            </Typography>
            <Typography level="h5">It&apos;s open source too :3</Typography>
            <Stack spacing={10} direction="row" alignItems="center">
                <Typography level="h5">Meanwhile you can</Typography>
                <Button
                    onClick={() => {
                        navigate({
                            to: "/ui",
                        });
                    }}
                    size="lg"
                    variant="solid"
                    color="info"
                >
                    Go to the UI playground
                </Button>
            </Stack>
            {account && (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    mt="2rem"
                    direction="column"
                >
                    <Typography level="body-lg">
                        How the hell did you login? :0
                    </Typography>
                    <Typography level="body-lg">
                        Hi {account.globalName ?? account.username} :3
                    </Typography>
                    <Typography my="1em" level="body-sm">
                        I mean you can logout if you want to
                    </Typography>
                    <Button
                        onClick={() => {
                            app.logout();
                            navigate({
                                to: "/",
                            });
                        }}
                        size="sm"
                        variant="solid"
                        color="danger"
                    >
                        Logout
                    </Button>
                </Stack>
            )}
        </Stack>
    );
}
