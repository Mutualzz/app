import { useAppStore } from "@hooks/useStores";
import { Tooltip, useTheme } from "@mutualzz/ui-web";
import { useNavigate } from "@tanstack/react-router";
import { switchMode } from "@utils/index";
import { observer } from "mobx-react-lite";
import { AnimatePresence } from "motion/react";
import { GiGalaxy } from "react-icons/gi";
import { ImFeed } from "react-icons/im";
import { AnimatedIconButton } from "./Animated/AnimatedIconButton";
import { TooltipWrapper } from "./TooltipWrapper";

export const ModeSwitcher = observer(() => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const targetMode = app.targetMode;

    const title = `Switch to ${targetMode === "feed" ? "Feed" : "Spaces"}`;

    const handleClick = () => {
        switchMode(app, navigate);
    };

    if (app.isAppLoading) return null;

    return (
        <AnimatePresence>
            {!app.hideSwitcher && (
                <Tooltip
                    placement="left"
                    content={
                        <TooltipWrapper
                            paperProps={{
                                elevation: app.settings?.preferEmbossed ? 5 : 1,
                                p: 1,
                            }}
                            typographyProps={{
                                level: "body-sm",
                            }}
                        >
                            {title}
                        </TooltipWrapper>
                    }
                >
                    <AnimatedIconButton
                        css={{
                            position: "fixed",
                            bottom:
                                24 +
                                (app.channels.active != undefined &&
                                app.mode === "spaces" &&
                                !app.memberListVisible
                                    ? 60
                                    : 0),
                            right: 24,
                            borderRadius: 9999,
                            zIndex: theme.zIndex.fab,
                        }}
                        color="primary"
                        size={30}
                        variant="solid"
                        onClick={handleClick}
                        aria-label={title}
                        whileTap={{ scale: 0.75 }}
                        whileHover={{ scale: 0.9 }}
                        animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                        transition={{
                            scale: {
                                duration: 1,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                            },
                            opacity: {
                                duration: 0.4,
                                ease: "easeOut",
                            },
                        }}
                    >
                        {targetMode === "feed" ? <ImFeed /> : <GiGalaxy />}
                    </AnimatedIconButton>
                </Tooltip>
            )}
        </AnimatePresence>
    );
});
