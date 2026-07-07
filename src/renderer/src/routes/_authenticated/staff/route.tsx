import { useAppStore } from "@hooks/useStores";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import Loading from "@components/Loader/Loading";

export const Route = createFileRoute("/_authenticated/staff")({
  component: observer(StaffRoute)
});

function StaffRoute() {
  const app = useAppStore();

  if (app.isAppLoading) return <Loading />;
  if (!app.account?.isStaff) return <Navigate to="/" replace />;

  return <Outlet />;
}
