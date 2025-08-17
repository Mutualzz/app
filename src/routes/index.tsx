import { Logo } from "@components/Logo";
import { ThemeCreator } from "@components/ThemeCreator";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
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
    const { openModal } = useModal();

    return (
        <Stack
            direction="column"
            height="100vh"
            justifyContent="center"
            alignItems="center"
            spacing="1rem"
        >
            <Logo css={{ width: 128, height: 128 }} />
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
                    variant="solid"
                    color="info"
                >
                    Go to the UI playground
                </Button>
                {!account && (
                    <>
                        or
                        <Button
                            onClick={() => {
                                navigate({
                                    to: "/login",
                                });
                            }}
                            size="md"
                            variant="solid"
                            color="success"
                        >
                            Go to the Login page
                        </Button>
                    </>
                )}
            </Stack>
            {account && (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    mt="2rem"
                    direction="column"
                >
                    <Typography level="body-lg">
                        Hi {account.globalName ?? account.username} :3
                    </Typography>
                    <Stack
                        spacing={10}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Typography>For now you can either</Typography>
                        <Button
                            onClick={() => {
                                app.logout();
                            }}
                            size="lg"
                            variant="solid"
                            color="danger"
                        >
                            Logout
                        </Button>
                        or
                        <Button
                            onClick={() => {
                                openModal("theme-maker", <ThemeCreator />, {
                                    disableBackdropClick: true,
                                });
                            }}
                            size="lg"
                            variant="solid"
                            color="primary"
                        >
                            Create themes
                        </Button>
                    </Stack>
                </Stack>
            )}
        </Stack>
    );
}
