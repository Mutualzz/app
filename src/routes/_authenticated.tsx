import { useAppStore } from "@hooks/useAppStore";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
    component: AuthenticatedRoute,
});

function AuthenticatedRoute() {
    const navigate = useNavigate();
    const app = useAppStore();

    if (!app.token) {
        navigate({ to: "/login", replace: true });
        return null;
    }

    return <Outlet />;
}
