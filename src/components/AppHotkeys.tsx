import { useNavigate } from "@tanstack/react-router";
import { useGlobalHotkeys } from "@hooks/useGlobalHotkeys";
import { useAppStore } from "@hooks/useStores";
import { useEffect } from "react";
import { loadBlockers } from "@hooks/blockers/loadBlockers";

export const AppHotkeys = () => {
    const app = useAppStore();
    const navigate = useNavigate();

    useGlobalHotkeys({
        "alt+left": () =>
            app.navigation.canBack && app.navigation.back(navigate),
        "alt+right": () =>
            app.navigation.canForward && app.navigation.forward(navigate),
    });

    useEffect(() => loadBlockers(), []);

    return null;
};
