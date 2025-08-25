import { useAppStore } from "@hooks/useStores";
import { Button, IconButton, Paper, Stack, useTheme } from "@mutualzz/ui";
import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "@tanstack/react-router";
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
            pb={{ xs: "0.75rem", sm: "1rem" }}
            css={{
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                userSelect: "none",
                position: "sticky",
                bottom: 0,
                zIndex: 100,
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
                    aria-label="Home"
                >
                    <FaHome />
                </IconButton>
                {!account && (
                    <>
                        <DownloadButton
                            color="success"
                            variant="plain"
                            aria-label="Download"
                            startDecorator={<FaDownload />}
                        />
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
