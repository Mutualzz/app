import { DownloadButton } from "@components/DownloadButton";
import { useAppStore } from "@hooks/useStores";
import { Avatar, Button, Paper, Stack } from "@mutualzz/ui";
import { useNavigate } from "@tanstack/react-router";
import { isTauri } from "@utils/index";
import { observer } from "mobx-react";
import { motion } from "motion/react";
import { Logo } from "../Logo";

const AnimatedLogo = motion.create(Logo);
const AnimatedPaper = motion.create(Paper);

export const TopNavigation = observer(() => {
    const navigate = useNavigate();
    const { account } = useAppStore();

    return (
        <AnimatedPaper
            p="0.25rem 0.75rem"
            elevation={2}
            justifyContent="space-between"
            alignItems="center"
            css={{
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
            }}
            initial={{
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                y: -80,
            }}
            animate={{
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                y: 0,
            }}
        >
            <AnimatedLogo
                css={{
                    width: 64,
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
            {account ? (
                <Avatar
                    size="lg"
                    src={account.avatarUrl}
                    alt={account.username}
                />
            ) : (
                <Stack spacing={!isTauri ? 10 : 0}>
                    {!isTauri && <DownloadButton />}

                    <Button
                        onClick={() => {
                            navigate({
                                to: "/login",
                                replace: true,
                            });
                        }}
                        color="success"
                    >
                        Login
                    </Button>
                </Stack>
            )}
        </AnimatedPaper>
    );
});
