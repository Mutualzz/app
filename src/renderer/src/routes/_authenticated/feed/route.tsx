import { FeedSidebar } from "@components/Feed/FeedSidebar";
import {
  SIDEBAR_RAIL_USERBAR_WIDTH,
  SIDEBAR_RAIL_WIDTH
} from "@components/Navigation/SidebarRail";
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
    <Stack width="100%" height="100%" direction="row" position="relative">
      <Stack
        width={SIDEBAR_RAIL_WIDTH}
        minWidth={SIDEBAR_RAIL_WIDTH}
        height="100%"
        flexShrink={0}
      >
        <FeedSidebar />
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
      <Stack
        position="absolute"
        bottom={0}
        left={0}
        width={SIDEBAR_RAIL_USERBAR_WIDTH}
      >
        <UserBar />
      </Stack>
    </Stack>
  );
}
