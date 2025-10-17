import { useAppStore } from "@hooks/useStores";
import { IconButton, Tooltip, useTheme } from "@mutualzz/ui-web";
import { useNavigate } from "@tanstack/react-router";
import { switchMode } from "@utils/index";
import { observer } from "mobx-react";

export const ModeSwitcher = observer(() => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { mode } = app;
    const { theme } = useTheme();

    return (
        <Tooltip
            title={mode === "feed" ? "Switch to Spaces" : "Switch to Feed"}
        >
            <IconButton
                css={{
                    position: "absolute",
                    bottom: 24,
                    right: 36,
                    borderRadius: 9999,
                    zIndex: theme.zIndex.fab,
                }}
                color="primary"
                size={36}
                onClick={() => switchMode(navigate)}
                variant="solid"
            >
                {mode === "feed" && <>{"📰"}</>}
                {mode === "spaces" && <>{"🌌"}</>}
            </IconButton>
        </Tooltip>
    );
});
