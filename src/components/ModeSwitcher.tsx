import { useAppStore } from "@hooks/useStores";
import { Tooltip, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "@tanstack/react-router";
import { switchMode } from "@utils/index";
import { observer } from "mobx-react";
import { useState } from "react";
import { GiGalaxy } from "react-icons/gi";
import { ImFeed, ImSpinner11 } from "react-icons/im";
import { AnimatedIconButton } from "./Animated/AniamtedIconButton";

export const ModeSwitcher = observer(() => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { mode } = app;
    const { theme } = useTheme();
    const [hoverOpen, setHoverOpen] = useState(false);

    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media ", ""),
    );

    const preferredMode = app.account?.settings.preferredMode as
        | "feed"
        | "spaces"
        | undefined;

    const targetMode: "feed" | "spaces" =
        mode === "feed"
            ? "spaces"
            : mode === "spaces"
              ? "feed"
              : (preferredMode ?? "feed");

    const title = `Switch to ${targetMode === "feed" ? "Feed" : "Spaces"}`;

    const handleClick = () => {
        switchMode(navigate);
    };

    return (
        <Tooltip open={hoverOpen} title={title}>
            <AnimatedIconButton
                css={{
                    position: "absolute",
                    bottom: 24,
                    right: 36,
                    borderRadius: 9999,
                    zIndex: theme.zIndex.fab,
                }}
                color="primary"
                size={isMobileQuery ? 28 : 36}
                variant="solid"
                onMouseEnter={() => setHoverOpen(true)}
                onMouseLeave={() => setHoverOpen(false)}
                onClick={handleClick}
                aria-label={title}
                whileTap={{ scale: 0.75 }}
                whileHover={{
                    scale: 0.9,
                }}
            >
                {mode === null ? (
                    <ImSpinner11 />
                ) : targetMode === "feed" ? (
                    <ImFeed />
                ) : (
                    <GiGalaxy />
                )}
            </AnimatedIconButton>
        </Tooltip>
    );
});
