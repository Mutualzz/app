import { ThemeCreator } from "@components/ThemeCreator";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Link, Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { switchMode } from "@utils/index";
import { observer } from "mobx-react";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
    component: observer(Index),
});

function Index() {
    const app = useAppStore();
    const { account } = app;
    const navigate = useNavigate();
    const { openModal } = useModal();

    useEffect(() => {
        app.resetMode();
    }, []);

    return (
        <Stack
            width={{ xs: "100vw", sm: "100vw" }}
            minHeight={{ xs: "100vh", sm: "100vh" }}
        >
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={{ xs: 4, sm: 6, md: 10 }}
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
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                >
                    <Typography
                        level={{ xs: "h5", sm: "h4", md: "h3", lg: "h2" }}
                        textAlign="center"
                        fontWeight={{ xs: 600, sm: 700 }}
                    >
                        Website is currently under heavy development
                    </Typography>
                    <Typography level="body-sm">
                        and has placeholders for now :3
                    </Typography>
                </Stack>
                <Typography level={{ xs: "body-xs", sm: "body-sm", md: "h6" }}>
                    The UI is being made from scratch and many features are
                    still missing
                </Typography>
                <Typography level={{ xs: "body-sm", sm: "h6", md: "h5" }}>
                    It&apos;s{" "}
                    <Link
                        color="success"
                        underline="hover"
                        variant="plain"
                        href="https://github.com/mutualzz"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        open source
                    </Link>{" "}
                    too :3
                </Typography>
                <Stack
                    spacing={{ xs: 4, sm: 6, md: 10 }}
                    alignItems="center"
                    direction={{ xs: "column", sm: "row" }}
                    width="100%"
                    justifyContent="center"
                    flexWrap="wrap"
                >
                    <Typography level={{ xs: "body-sm", sm: "h6" }}>
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
                    <Typography>to test components and themes</Typography>
                    {!account && (
                        <>
                            <Typography
                                fontWeight="bold"
                                level={{ xs: "body-sm", sm: "body-md" }}
                            >
                                or click the login button top right
                            </Typography>
                        </>
                    )}
                </Stack>
                <Typography
                    fontWeight="bold"
                    variant="plain"
                    color="info"
                    spacing={{ xs: 2, sm: 4, md: 6 }}
                    level={{ xs: "body-sm", sm: "h6" }}
                >
                    Currently working on: Layouts for Feed and Spaces,
                </Typography>
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
                            >
                                Hi
                            </Typography>
                            <Stack
                                spacing={5}
                                justifyContent="center"
                                alignItems="center"
                                direction="row"
                            >
                                <UserAvatar
                                    user={account}
                                    size={{ xs: "sm", sm: "md", md: "lg" }}
                                />
                                <Typography
                                    level={{ xs: "body-md", sm: "body-lg" }}
                                >
                                    {account.globalName ?? account.username}
                                </Typography>
                            </Stack>
                            <Typography
                                level={{ xs: "body-md", sm: "body-lg" }}
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
                                >
                                    or
                                </Typography>
                                <Button
                                    onClick={() => {
                                        openModal(
                                            "theme-maker",
                                            <ThemeCreator />,
                                            {
                                                height: "100%",
                                            },
                                        );
                                    }}
                                    size={{ xs: "sm", sm: "md", md: "lg" }}
                                    variant="solid"
                                    color="primary"
                                >
                                    Create themes
                                </Button>
                                <Typography
                                    level={{ xs: "body-sm", sm: "body-md" }}
                                >
                                    or
                                </Typography>
                                <Button
                                    onClick={() => {
                                        switchMode(navigate);
                                    }}
                                    size={{ xs: "sm", sm: "md", md: "lg" }}
                                    variant="solid"
                                    color="info"
                                >
                                    Switch to{" "}
                                    {account.settings.preferredMode === "feed"
                                        ? "Feed"
                                        : "Spaces"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                )}
            </Stack>
        </Stack>
    );
}
