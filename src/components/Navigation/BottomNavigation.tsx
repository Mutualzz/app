import { useAppStore } from "@hooks/useStores";
import { Button, IconButton, Paper, Stack, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "@tanstack/react-router";
import { isTauri } from "@utils/index";
import { observer } from "mobx-react";
import { FaClipboard, FaDownload, FaHome } from "react-icons/fa";
import { MdLogin } from "react-icons/md";
import { DownloadButton } from "../DownloadButton";
import { UserDrawer } from "../User/UserDrawer";

export const BottomNavigation = observer(() => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media ", ""),
    );

    const { account } = useAppStore();

    if (!isMobileQuery) return null;

    return (
        <Paper
            elevation={2}
            width="100%"
            pt="0.5rem"
            pb="max(0.75rem, env(safe-area-inset-bottom, 0px))"
            pl="calc(env(safe-area-inset-left, 0px) + 1.5rem)"
            pr="calc(env(safe-area-inset-right, 0px) + 1.5rem)"
            position="sticky"
            bottom={0}
            zIndex={100}
            css={{
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                userSelect: "none",
                position: "sticky",
                bottom: 0,
                zIndex: 100,
                backgroundClip: "padding-box",
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
            >
                <IconButton
                    onClick={() => navigate({ to: "/" })}
                    color="neutral"
                    variant="plain"
                    aria-label="Home"
                    size="lg"
                >
                    <FaHome />
                </IconButton>
                {!account && (
                    <>
                        {!isTauri && (
                            <DownloadButton
                                color="success"
                                variant="plain"
                                aria-label="Download"
                                size="lg"
                                startDecorator={<FaDownload />}
                            />
                        )}
                        <Button
                            startDecorator={<FaClipboard />}
                            onClick={() => navigate({ to: "/privacy" })}
                            color="danger"
                            size="lg"
                            variant="plain"
                        >
                            Privacy Policy
                        </Button>
                        <IconButton
                            color="success"
                            variant="plain"
                            aria-label="Login"
                            size="lg"
                            onClick={() => navigate({ to: "/login" })}
                        >
                            <MdLogin />
                        </IconButton>
                    </>
                )}
                {account && <UserDrawer onlyAvatar />}
            </Stack>
        </Paper>
    );
});
