import { useAppStore } from "@hooks/useStores";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import Loading from "@components/Loader/Loading";

export const Route = createFileRoute("/_authenticated")({
  component: observer(AuthenticatedRoute)
});

function AuthenticatedRoute() {
  const app = useAppStore();

  if (app.isAppLoading) return <Loading />;
  if (!app.token) return <Navigate to="/login" replace />;

  return <Outlet />;
}
