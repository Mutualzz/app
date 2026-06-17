import { AvatarEditorPage } from "@components/Avatar/AvatarEditorPage";
import { isAvatarEditorMethod } from "@components/Avatar/avatarEditor.types";
import Loading from "@components/Loader/Loading";
import { useAppStore } from "@hooks/useStores";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

export const Route = createFileRoute("/_authenticated/avatar")({
  validateSearch: (search) => ({
    method: isAvatarEditorMethod(search.method) ? search.method : "upload"
  }),
  component: observer(RouteComponent)
});

function RouteComponent() {
  const app = useAppStore();

  if (app.isAppLoading) return <Loading />;
  if (!app.account) return <Navigate to="/login" replace />;

  return <AvatarEditorPage />;
}
