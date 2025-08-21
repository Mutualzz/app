import { ThemeCreator } from "@components/ThemeCreator";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Avatar, Button, Stack, Typography } from "@mutualzz/ui";
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
            justifyContent="center"
            alignItems="center"
            spacing="0.5rem"
            width="100%"
        >
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
                        <Typography fontWeight="bold">
                            click the login button top right
                        </Typography>
                    </>
                )}
            </Stack>
            {account && (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    mt="2rem"
                    direction="column"
                    spacing={10}
                >
                    <Stack
                        spacing={5}
                        justifyContent="center"
                        alignItems="center"
                    >
                        Hi
                        <Stack
                            spacing={1}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Avatar src={account.avatarUrl} />
                            {account.globalName ?? account.username}
                        </Stack>
                        :3
                    </Stack>
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
