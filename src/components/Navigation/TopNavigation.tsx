import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { DownloadButton } from "@components/DownloadButton";
import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useAppStore } from "@hooks/useStores";
import { Box, Button, Stack, Tooltip, useTheme } from "@mutualzz/ui-web";
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
            zIndex={theme.zIndex.appBar}
            position="sticky"
            top={0}
            py={1}
            boxShadow="none"
            elevation={app.preferEmbossed ? 1 : 0}
            variant="plain"
            css={{
                userSelect: "none",
            }}
        >
            <Stack
                spacing={4}
                direction="row"
                height="100%"
                alignItems="center"
                pl={4.0375}
            >
                <Box>
                    <Tooltip
                        title={
                            <TooltipWrapper>
                                Switch to{" "}
                                {capitalize(
                                    app.settings?.preferredMode ?? "Spaces",
                                )}
                            </TooltipWrapper>
                        }
                        placement="right"
                    >
                        <AnimatedLogo
                            css={{
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
                    <Stack spacing={1.25} width="100%" direction="row">
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
                spacing={{ xs: 0.5, sm: 1.5, md: 2.5 }}
            >
                {!app.account && (
                    <Stack
                        direction="row"
                        pr={2.5}
                        spacing={1.5}
                        alignItems="center"
                    >
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
