import { useAppStore } from "@hooks/useStores";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createFileRoute("/_authenticated")({
    component: observer(AuthenticatedRoute),
});

function AuthenticatedRoute() {
    const app = useAppStore();

    if (!app.account) return <Navigate to="/login" replace />;

    return <Outlet />;
}
