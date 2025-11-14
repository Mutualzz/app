import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { DownloadButton } from "@components/DownloadButton";
import { useAppStore } from "@hooks/useStores";
import { Box, Button, Paper, Stack, Tooltip, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "@tanstack/react-router";
import { isTauri } from "@utils/index";
import capitalize from "lodash-es/capitalize";
import { observer } from "mobx-react";
import { FaClipboard, FaDownload, FaUser } from "react-icons/fa";
import { GiGalaxy } from "react-icons/gi";
import { ImFeed } from "react-icons/im";

export const TopNavigation = observer(() => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media ", ""),
    );

    const app = useAppStore();

    if (isMobileQuery) return null;

    return (
        <Paper
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            elevation={2}
            zIndex={theme.zIndex.appBar}
            position="sticky"
            top={0}
            pt="0.5rem"
            css={{
                userSelect: "none",
            }}
            style={{
                boxShadow: "none",
            }}
        >
            <Stack
                spacing={20}
                direction="row"
                height="100%"
                alignItems="center"
                pl={16.15}
            >
                <Box>
                    <Tooltip
                        title={`Switch to ${capitalize(app.settings?.preferredMode ?? "Spaces")}`}
                        placement="right"
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
                                    to: `/${app.settings?.preferredMode ?? "spaces"}`,
                                    replace: true,
                                });
                            }}
                        />
                    </Tooltip>
                </Box>

                {app.mode && (
                    <Stack spacing={5} width="100%" direction="row">
                        {app.mode === "feed" ? <ImFeed /> : <GiGalaxy />}
                        {app.mode === "feed" ? "Feed" : "Spaces"}
                    </Stack>
                )}
            </Stack>

            <Stack
                flex={1}
                justifyContent="flex-end"
                alignItems="center"
                direction="row"
                spacing={{ xs: 2, sm: 6, md: 10 }}
                pr={16.15}
            >
                {!app.account && (
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
