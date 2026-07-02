import { FeedSidebar } from "@components/Feed/FeedSidebar";
import { Paper } from "@components/Paper";
import { UserBar } from "@components/User/UserBar";
import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/feed")({
  component: observer(RouteComponent)
});

function RouteComponent() {
  const app = useAppStore();

  useEffect(() => {
    if (app.mode !== "feed") app.setMode("feed");

    return () => {
      if (app.mode === "feed") app.resetMode();
    };
  }, []);

  return (
    <Stack width="100%" height="100%" direction="row">
      <Stack
        position="relative"
        maxWidth="17.5rem"
        width="100%"
        direction="column"
      >
        <FeedSidebar />
        <UserBar />
      </Stack>
      <Paper
        borderRight="0 !important"
        borderBottom="0 !important"
        borderTopLeftRadius="0.75rem"
        width="100%"
        p={5}
        height="100%"
      >
        <Outlet />
      </Paper>
    </Stack>
  );
}
