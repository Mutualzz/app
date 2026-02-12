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

    const lastHref = app.navigation.current?.href;
    if (
        app.token &&
        lastHref &&
        (lastHref.startsWith("/spaces") || lastHref.startsWith("/feed"))
    )
        return <Navigate to={lastHref} replace />;

    // NOTE: This "as" is added because we havent implemented DMs yet
    return (
        <Navigate
            to={`/${(app.settings?.preferredMode as "feed" | "spaces") ?? "feed"}`}
        />
    );
}
