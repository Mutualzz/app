import { useAppStore } from "@hooks/useStores";
import {
    Button,
    Divider,
    IconButton,
    Paper,
    Stack,
    useTheme,
} from "@mutualzz/ui";
import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "@tanstack/react-router";
import { isMobile, isTauri } from "@utils/index";
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
            pt={{ xs: "0.75rem", sm: "1rem" }}
            pb="calc(env(safe-area-inset-bottom, 0px) + 0.75rem)"
            pl="calc(env(safe-area-inset-left, 0px) + 1rem)"
            pr="calc(env(safe-area-inset-right, 0px) + 1rem)"
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
                >
                    <FaHome />
                </IconButton>
                {!account && (
                    <>
                        <Divider orientation="vertical" />
                        {!isTauri && !isMobile && (
                            <>
                                <DownloadButton
                                    color="success"
                                    variant="plain"
                                    aria-label="Download"
                                    startDecorator={<FaDownload />}
                                />
                                <Divider orientation="vertical" />
                            </>
                        )}
                        <Button
                            startDecorator={<FaClipboard />}
                            onClick={() => navigate({ to: "/privacy" })}
                            color="danger"
                            variant="plain"
                        >
                            Privacy Policy
                        </Button>
                        <Divider orientation="vertical" />
                        <IconButton
                            color="success"
                            variant="plain"
                            aria-label="Login"
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
