import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate
} from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { useEffect } from "react";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { UserBar } from "@components/User/UserBar";
import { motion } from "motion/react";
import { dynamicElevation } from "@mutualzz/ui-core";
import { DMChannelList } from "@components/DMChannel/DMChannelList";
import { Button } from "@components/Button";
import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { SpacesSidebar } from "@components/Space/SpacesSidebar";
import { UsersIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useBridgeListSync } from "@hooks/useBridgeListSync";

export const Route = createFileRoute("/_authenticated/@me")({
  component: observer(RouteComponent)
});

const ResizeBar = motion.create("div");

const MIN_WIDTH = 320;
const MAX_WIDTH = 480;

function RouteComponent() {
  const { t: tChat } = useTranslation("chat");
  const app = useAppStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const bridgesQuery = useBridgeListSync();

  const friendsMode = pathname.includes("/friends");

  useEffect(() => {
    if (app.mode !== "@me") app.setMode("@me");
    app.spaces.setActive("@me");

    return () => {
      if (app.mode === "@me") app.resetMode();
    };
  }, []);

  useEffect(() => {
    if (!pathname.startsWith("/@me/bridges")) return;

    const bridgeId = pathname.match(/\/@me\/bridges\/([^/]+)/)?.[1];
    if (!bridgeId) {
      const space = app.spaces.mostRecentSpace ?? app.spaces.all[0];
      if (space) {
        app.spaces.setSidebarTab(space.id, "bridges");
        navigate({
          to: "/spaces/$spaceId",
          params: { spaceId: space.id },
          replace: true
        });
      }
      return;
    }

    const spaceId =
      app.bridgeChat.spaceIdByBridge.get(bridgeId) ??
      bridgesQuery.data?.find((bridge) => bridge.id === bridgeId)?.spaceId;

    if (!spaceId) return;

    app.spaces.setSidebarTab(spaceId, "bridges");
    navigate({
      to: "/spaces/$spaceId/bridges/$bridgeId",
      params: { spaceId, bridgeId },
      replace: true
    });
  }, [pathname, app, navigate, bridgesQuery.data]);

  useEffect(() => {
    if (pathname !== "/@me") return;
    app.spaces.setActive("@me");

    const preferredDM =
      app.channels.getMostRecentChannelForSpace("@me") ?? app.channels.dms[0];
    if (!preferredDM) return;

    navigate({
      to: "/@me/$channelId",
      params: {
        channelId: preferredDM.id
      },
      replace: true
    });
  }, [pathname, app.isGatewayReady]);

  return (
    <Stack width="100%" height="100%" direction="row">
      <Stack
        position="relative"
        width={app.dmChannelListWidth}
        minWidth={MIN_WIDTH}
        maxWidth={MAX_WIDTH}
        direction="column"
        flexShrink={0}
        height="100%"
      >
        <Stack height="100%" direction="row" minWidth={0}>
          <SpacesSidebar />
          <Paper
            position="relative"
            flex={1}
            minWidth={0}
            borderLeft="0 !important"
            elevation={app.settings?.preferEmbossed ? 4 : 0}
          >
            <Stack width="100%" height="100%" direction="column">
              <Stack direction="column" p={1.75} spacing={1.25}>
                <Button
                  fullWidth
                  startDecorator={<UsersIcon weight="fill" />}
                  horizontalAlign="left"
                  variant={friendsMode ? "soft" : "plain"}
                  onClick={() => navigate({ to: "/@me/friends" })}
                >
                  {tChat("friends.title")}
                </Button>
              </Stack>
              <DMChannelList />
            </Stack>
            <ResizeBar
              onPointerDown={(e) => {
                const startX = e.clientX;
                const startWidth = app.dmChannelListWidth;

                (e.currentTarget as HTMLDivElement).setPointerCapture(
                  e.pointerId
                );

                const onMove = (moveEvent: PointerEvent) => {
                  app.setDmChannelListWidth(
                    startWidth + (moveEvent.clientX - startX)
                  );
                };

                const onUp = () => {
                  window.removeEventListener("pointermove", onMove);
                  window.removeEventListener("pointerup", onUp);
                };

                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
              }}
              style={{
                width: 2,
                marginLeft: -1,
                marginRight: -1,
                cursor: "col-resize",
                flexShrink: 0,
                touchAction: "none",
                userSelect: "none",
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                backgroundColor: app.settings?.preferEmbossed
                  ? dynamicElevation(theme.colors.surface, 4)
                  : "transparent"
              }}
              whileHover={{
                backgroundColor: app.settings?.preferEmbossed
                  ? dynamicElevation(theme.colors.surface, 6)
                  : dynamicElevation(theme.colors.surface, 2)
              }}
            />
          </Paper>
        </Stack>
        <UserBar />
      </Stack>
      <Stack height="100%" width="100%">
        <Outlet />
      </Stack>
    </Stack>
  );
}
