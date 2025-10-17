import { useAppStore } from "@hooks/useStores";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
    component: AuthenticatedRoute,
});

function AuthenticatedRoute() {
    const navigate = useNavigate();
    const { account } = useAppStore();

    if (!account) {
        navigate({ to: "/login", replace: true });
        return null;
    }

    return <Outlet />;
}
