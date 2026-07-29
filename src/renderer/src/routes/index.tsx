import { useAppStore } from "@hooks/useStores";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { resolveResumePath } from "@mutualzz/client";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: observer(RouteComponent)
});

function RouteComponent() {
  const app = useAppStore();

  useEffect(() => {
    app.resetMode();
  }, [app]);

  if (app.isAppLoading) return null;

  if (app.joiningInviteCode) {
    return (
      <Navigate
        to="/invite/$code"
        replace
        params={{ code: app.joiningInviteCode }}
        search={{ deepLink: false }}
      />
    );
  }

  if (!app.token) return <Navigate to="/login" replace />;

  if (app.isGatewayReady && app.needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Navigate
      to={resolveResumePath(
        app as Parameters<typeof resolveResumePath>[0],
        app.navigation.lastRoute,
      )}
      replace
    />
  );
}
