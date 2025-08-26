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
            width={{ xs: "100vw", sm: "100vw" }}
            minHeight={{ xs: "100vh", sm: "100vh" }}
        >
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={{ xs: 2, sm: 3, md: 4 }}
                width={{
                    xs: "100%",
                    sm: "90%",
                    md: "70%",
                    lg: "50%",
                    xl: "40%",
                }}
                maxWidth={{ xs: "100%", sm: "500px", md: "700px", lg: "900px" }}
                mx="auto"
            >
                <Typography
                    level={{ xs: "h5", sm: "h4", md: "h3", lg: "h2" }}
                    textAlign="center"
                    fontSize={{
                        xs: "1.25rem",
                        sm: "1.5rem",
                        md: "2rem",
                        lg: "2.5rem",
                    }}
                    fontWeight={{ xs: 600, sm: 700 }}
                    mb={{ xs: "0.5rem", sm: "1rem" }}
                >
                    Website is currently under heavy development
                </Typography>
                <Typography
                    level={{ xs: "body-md", sm: "body-md", md: "h6" }}
                    fontSize={{ xs: "1rem", sm: "1.125rem", md: "1.25rem" }}
                    mb={{ xs: "0.25rem", sm: "0.5rem" }}
                >
                    The UI is being made from scratch
                </Typography>
                <Typography
                    level={{ xs: "body-sm", sm: "h6", md: "h5" }}
                    fontSize={{ xs: "0.95rem", sm: "1.1rem", md: "1.25rem" }}
                    mb={{ xs: "0.5rem", sm: "1rem" }}
                >
                    It&apos;s open source too :3
                </Typography>
                <Stack
                    spacing={{ xs: 2, sm: 4, md: 6 }}
                    alignItems="center"
                    direction={{ xs: "column", sm: "row" }}
                    width="100%"
                    justifyContent="center"
                    flexWrap="wrap"
                    mb={{ xs: "1rem", sm: "2rem" }}
                >
                    <Typography
                        level={{ xs: "body-sm", sm: "h6" }}
                        fontSize={{ xs: "0.95rem", sm: "1.1rem" }}
                    >
                        Meanwhile you can
                    </Typography>
                    <Button
                        onClick={() => {
                            navigate({
                                to: "/ui",
                            });
                        }}
                        variant="solid"
                        color="info"
                        size={{ xs: "sm", sm: "md", md: "lg" }}
                    >
                        Go to the UI playground
                    </Button>
                    {!account && (
                        <>
                            <Typography
                                fontWeight="bold"
                                level={{ xs: "body-sm", sm: "body-md" }}
                                fontSize={{ xs: "0.95rem", sm: "1.1rem" }}
                            >
                                or click the login button top right
                            </Typography>
                        </>
                    )}
                </Stack>
                {account && (
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        mt={{ xs: "1rem", sm: "2rem" }}
                        direction="column"
                        spacing={{ xs: 4, sm: 8, md: 10 }}
                        width="100%"
                    >
                        <Stack
                            spacing={{ xs: 4, sm: 8, md: 9 }}
                            justifyContent="center"
                            alignItems="center"
                            width="100%"
                        >
                            <Typography
                                level={{ xs: "body-md", sm: "body-lg" }}
                                fontSize={{ xs: "1rem", sm: "1.25rem" }}
                            >
                                Hi
                            </Typography>
                            <Stack
                                spacing={5}
                                justifyContent="center"
                                alignItems="center"
                                direction="row"
                            >
                                <Avatar
                                    src={account.avatarUrl}
                                    size={{ xs: "sm", sm: "md", md: "lg" }}
                                />
                                <Typography
                                    level={{ xs: "body-md", sm: "body-lg" }}
                                    fontSize={{ xs: "1rem", sm: "1.25rem" }}
                                >
                                    {account.globalName ?? account.username}
                                </Typography>
                            </Stack>
                            <Typography
                                level={{ xs: "body-md", sm: "body-lg" }}
                                fontSize={{ xs: "1rem", sm: "1.25rem" }}
                            >
                                :3
                            </Typography>
                        </Stack>
                        <Stack
                            spacing={{ xs: 2, sm: 6, md: 10 }}
                            justifyContent="center"
                            alignItems="center"
                            direction={{ xs: "column", sm: "row" }}
                            width="100%"
                        >
                            <Typography
                                level={{ xs: "body-sm", sm: "body-md" }}
                                fontSize={{ xs: "0.95rem", sm: "1.1rem" }}
                            >
                                For now you can either
                            </Typography>
                            <Stack
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                spacing={4}
                            >
                                <Button
                                    onClick={() => {
                                        app.logout();
                                    }}
                                    variant="solid"
                                    color="danger"
                                    size={{ xs: "sm", sm: "md", md: "lg" }}
                                >
                                    Logout
                                </Button>
                                <Typography
                                    level={{ xs: "body-sm", sm: "body-md" }}
                                    fontSize={{ xs: "0.95rem", sm: "1.1rem" }}
                                >
                                    or
                                </Typography>
                                <Button
                                    onClick={() => {
                                        openModal(
                                            "theme-maker",
                                            <ThemeCreator />,
                                            {
                                                disableBackdropClick: true,
                                            },
                                        );
                                    }}
                                    size={{ xs: "sm", sm: "md", md: "lg" }}
                                    variant="solid"
                                    color="primary"
                                >
                                    Create themes
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                )}
            </Stack>
        </Stack>
    );
}
