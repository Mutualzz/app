import { useAppStore } from "@hooks/useStores";
import { Avatar, Paper } from "@mutualzz/ui";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { motion } from "motion/react";
import { Logo } from "../Logo";

const AnimatedLogo = motion.create(Logo);

export const TopNavigation = observer(() => {
    const navigate = useNavigate();
    const { account } = useAppStore();

    return (
        <Paper
            p="0.25rem 0.75rem"
            elevation={2}
            justifyContent="space-between"
            alignItems="center"
            css={{
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
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
                <></>
            )}
        </Paper>
    );
});
