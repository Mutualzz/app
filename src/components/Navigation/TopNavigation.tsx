import { DownloadButton } from "@components/DownloadButton";
import { useAppStore } from "@hooks/useStores";
import { Button, Divider, Paper, Stack, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "@tanstack/react-router";
import { isTauri } from "@utils/index";
import { observer } from "mobx-react";
import { motion } from "motion/react";
import { FaClipboard, FaDownload, FaUser } from "react-icons/fa";
import { GiGalaxy } from "react-icons/gi";
import { ImFeed } from "react-icons/im";
import { Logo } from "../Logo";

const AnimatedLogo = motion.create(Logo);

export const TopNavigation = observer(() => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media ", ""),
    );

    const app = useAppStore();
    const { account } = app;

    if (isMobileQuery) return null;

    return (
        <Paper
            p={"0.5rem 1rem"}
            elevation={2}
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            css={{
                userSelect: "none",
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}
        >
            <Stack
                spacing={5}
                direction="row"
                height="100%"
                alignItems="center"
            >
                <AnimatedLogo
                    css={{
                        width: 64,
                        minWidth: 32,
                        maxWidth: 48,
                        cursor: "pointer",
                    }}
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                        navigate({
                            to: "/",
                            replace: true,
                        });
                    }}
                />
                {app.mode && (
                    <>
                        <Divider lineColor="accent" orientation="vertical" />
                        <Paper spacing={5} py={2} px={6} direction="row">
                            {app.mode === "feed" ? <ImFeed /> : <GiGalaxy />}
                            {app.mode === "feed" ? "Feed" : "Spaces"}
                        </Paper>
                    </>
                )}
            </Stack>

            <Stack
                flex={1}
                justifyContent="flex-end"
                alignItems="center"
                direction="row"
                spacing={{ xs: 2, sm: 6, md: 10 }}
            >
                {!account && (
                    <Stack direction="row" spacing={5} alignItems="center">
                        <Button
                            startDecorator={<FaClipboard />}
                            onClick={() => navigate({ to: "/privacy" })}
                        >
                            Privacy Policy
                        </Button>
                        {!isTauri && (
                            <DownloadButton
                                startDecorator={<FaDownload />}
                                color="success"
                            />
                        )}
                        <Button
                            startDecorator={<FaUser />}
                            onClick={() => {
                                navigate({
                                    to: "/login",
                                    replace: true,
                                });
                            }}
                            color="neutral"
                            size={{ xs: "sm", sm: "md" }}
                        >
                            Login
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
});
