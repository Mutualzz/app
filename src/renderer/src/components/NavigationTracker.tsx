import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppStore } from "@hooks/useStores";

export const NavigationTracker = () => {
    const app = useAppStore();

    const href = useRouterState({
        select: (state) => state.location.href,
    });

    useEffect(() => {
        app.navigation.record(href);
    }, [href]);

    return null;
};
