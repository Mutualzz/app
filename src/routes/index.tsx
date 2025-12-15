import { useAppStore } from "@hooks/useStores";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
    component: observer(RouteComponent),
});

function RouteComponent() {
    const app = useAppStore();

    useEffect(() => {
        app.resetMode();
    }, []);

    if (app.joiningSpace && app.joiningInviteCode)
        return (
            <Navigate
                to="/invite/$code"
                replace
                params={{
                    code: app.joiningInviteCode,
                }}
                search={{
                    deepLink: false,
                }}
            />
        );

    if (!app.token) return <Navigate to="/login" replace />;

    return <Navigate to={`/${app.settings?.preferredMode ?? "feed"}`} />;
}
