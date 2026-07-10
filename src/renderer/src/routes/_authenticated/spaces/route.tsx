import { ChannelList } from "@components/Channel/ChannelList";
import { SpaceLockdownGuard } from "@components/Space/SpaceLockdownGuard";
import { SpaceLockdownOverlay } from "@components/Space/SpaceLockdownOverlay";
import { SpacesSidebar } from "@components/Space/SpacesSidebar";
import { UserBar } from "@components/User/UserBar";
import { useAppStore } from "@hooks/useStores";
import { Stack, useTheme } from "@mutualzz/ui-web";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams
} from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { dynamicElevation } from "@mutualzz/ui-core";
import { motion } from "motion/react";

export const Route = createFileRoute("/_authenticated/spaces")({
  component: observer(RouteComponent)
});

const ResizeBar = motion.create("div");

const MIN_WIDTH = 240;
const MAX_WIDTH = 480;

function RouteComponent() {
  const app = useAppStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const params = useParams({
    from: "/_authenticated/spaces/$spaceId",
    shouldThrow: false
  });
  const activeSpace = app.spaces.active;
  const isSpaceLockedDown = activeSpace?.isInLockdown ?? false;

  useEffect(() => {
    if (app.mode !== "spaces") app.setMode("spaces");

    return () => {
      if (app.mode === "spaces") app.resetMode();
    };
  }, []);

  useEffect(() => {
    if (params?.spaceId) return;
    if (!app.isGatewayReady) return;

    const space = app.spaces.setPreferredActive();
    if (!space) return;

    navigate({
      to: "/spaces/$spaceId",
      params: { spaceId: space.id },
      replace: true
    });
  }, [params?.spaceId, app.isGatewayReady]);

  return (
    <Stack width="100%" height="100%" direction="row">
      <Stack
        position="relative"
        width={app.channelListWidth}
        minWidth={MIN_WIDTH}
        maxWidth={MAX_WIDTH}
        direction="column"
        flexShrink={0}
        height="100%"
      >
        <Stack height="100%" direction="row">
          <SpacesSidebar />
          <Stack
            position="relative"
            flex={1}
            minWidth={0}
            height="100%"
            direction="row"
          >
            <ChannelList />
            <ResizeBar
              onPointerDown={(e) => {
                if (isSpaceLockedDown) return;

                const startX = e.clientX;
                const startWidth = app.channelListWidth;

                (e.currentTarget as HTMLDivElement).setPointerCapture(
                  e.pointerId
                );

                const onMove = (moveEvent: PointerEvent) => {
                  app.setChannelListWidth(
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
                cursor: isSpaceLockedDown ? "not-allowed" : "col-resize",
                flexShrink: 0,
                touchAction: "none",
                userSelect: "none",
                backgroundColor: app.settings?.preferEmbossed
                  ? dynamicElevation(theme.colors.surface, 4)
                  : "transparent"
              }}
              whileHover={
                isSpaceLockedDown
                  ? undefined
                  : {
                      backgroundColor: app.settings?.preferEmbossed
                        ? dynamicElevation(theme.colors.surface, 6)
                        : dynamicElevation(theme.colors.surface, 2)
                    }
              }
            />
            {activeSpace && (
              <SpaceLockdownOverlay
                space={activeSpace}
                showMessage={false}
                reserveBottom="4.5rem"
              />
            )}
          </Stack>
        </Stack>

        <UserBar />
      </Stack>

      <Stack height="100%" width="100%" position="relative">
        <Outlet />
        {activeSpace && <SpaceLockdownOverlay space={activeSpace} />}
      </Stack>
      <SpaceLockdownGuard />
    </Stack>
  );
}
