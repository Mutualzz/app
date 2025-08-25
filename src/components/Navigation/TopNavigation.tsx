import { DownloadButton } from "@components/DownloadButton";
import { UserDropdown } from "@components/User/UserDropdown";
import { useAppStore } from "@hooks/useStores";
import { Button, Paper, Stack, useTheme } from "@mutualzz/ui";
import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "@tanstack/react-router";
import { isMobile, isTauri } from "@utils/index";
import { observer } from "mobx-react";
import { motion } from "motion/react";
import { FaDownload, FaUser } from "react-icons/fa";
import { Logo } from "../Logo";

const AnimatedLogo = motion.create(Logo);

export const TopNavigation = observer(() => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media ", ""),
    );

    const { account } = useAppStore();

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
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                userSelect: "none",
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}
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

            <Stack
                flex={1}
                justifyContent="flex-end"
                alignItems="center"
                direction="row"
                spacing={{ xs: 2, sm: 6, md: 10 }}
            >
                {account ? (
                    <UserDropdown />
                ) : (
                    <Stack direction="row" spacing={5} alignItems="center">
                        {!isTauri && !isMobile && (
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
