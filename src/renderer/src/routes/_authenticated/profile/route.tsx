import { ProfileEditorPage } from "@components/Profile/editor/ProfileEditorPage";
import { useAppStore } from "@hooks/useStores";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import Loading from "@components/Loader/Loading";

export const Route = createFileRoute("/_authenticated/profile")({
  component: observer(RouteComponent)
});

function RouteComponent() {
  const app = useAppStore();

  if (app.isAppLoading) return <Loading />;
  if (!app.account) return <Navigate to="/login" replace />;

  return <ProfileEditorPage />;
}
