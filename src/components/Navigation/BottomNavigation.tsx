import { useAppStore } from "@hooks/useStores";
import { Button, IconButton, Paper, Stack, useTheme } from "@mutualzz/ui";
import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "@tanstack/react-router";
import { isMobile, isTauri } from "@utils/index";
import { observer } from "mobx-react";
import { FaDownload, FaHome, FaUser } from "react-icons/fa";
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
            pt={{ xs: "0.75rem", sm: "1rem" }}
            pl="calc(env(safe-area-inset-left, 0px) + 1.25rem)"
            pr="calc(env(safe-area-inset-right, 0px) + 1.25rem)"
            pb="calc(env(safe-area-inset-bottom, 0px) - 1.25rem)"
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
                px={{ xs: "1rem", sm: "1.5rem" }}
            >
                <IconButton
                    onClick={() => navigate({ to: "/" })}
                    color="neutral"
                    variant="plain"
                    size="lg"
                    aria-label="Home"
                >
                    <FaHome />
                </IconButton>
                {!account && (
                    <>
                        {!isTauri && !isMobile && (
                            <DownloadButton
                                color="success"
                                variant="plain"
                                aria-label="Download"
                                startDecorator={<FaDownload />}
                            />
                        )}
                        <Button
                            color="neutral"
                            variant="plain"
                            startDecorator={<FaUser />}
                            aria-label="Login"
                            onClick={() => navigate({ to: "/login" })}
                        >
                            Login
                        </Button>
                    </>
                )}
                {account && <UserDrawer onlyAvatar />}
            </Stack>
        </Paper>
    );
});
