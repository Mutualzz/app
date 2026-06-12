import { createFileRoute, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { useEffect } from "react";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { UserBar } from "@components/User/UserBar";
import { motion } from "motion/react";
import { dynamicElevation } from "@mutualzz/ui-core";
import { DMChannelList } from "@components/DMChannel/DMChannelList";
import { Button } from "@components/Button";
import capitalize from "lodash-es/capitalize";
import { observer } from "mobx-react-lite";
import { switchMode } from "@utils/index";
import { Paper } from "@components/Paper";
import { PlanetIcon, ScribbleIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated/@me")({
  component: observer(RouteComponent)
});

const ResizeBar = motion.create("div");

function RouteComponent() {
  const app = useAppStore();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const childParams = useParams({
    from: "/_authenticated/@me/$channelId",
    shouldThrow: false
  });

  useEffect(() => {
    if (app.mode !== "@me") app.setMode("@me");

    return () => {
      if (app.mode === "@me") app.resetMode();
    };
  }, []);

  useEffect(() => {
    if (childParams?.channelId) return;
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
  }, [childParams?.channelId, app.channels.dms]);

  return (
    <Stack width="100%" height="100%" direction="row">
      <Paper
        position="relative"
        maxWidth={480}
        minWidth={240}
        width={app.dmChannelListWidth}
        borderLeft="0 !important"
        elevation={app.settings?.preferEmbossed ? 4 : 0}
      >
        <Stack width="100%" height="100%" direction="column">
          <Stack direction="column" p={1.75} spacing={1.25}>
            <Button
              fullWidth
              startDecorator={
                app.targetMode === "feed" ? (
                  <ScribbleIcon />
                ) : (
                  <PlanetIcon weight="fill" />
                )
              }
              horizontalAlign="left"
              variant="plain"
              onClick={() => switchMode(app, navigate)}
            >
              Switch to {capitalize(app.targetMode)}
            </Button>
          </Stack>
          <DMChannelList />
        </Stack>
        <UserBar />
        <ResizeBar
          onPointerDown={(e) => {
            const startX = e.clientX;
            const startWidth = app.dmChannelListWidth;

            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

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
      <Stack height="100%" width="100%">
        <Outlet />
      </Stack>
    </Stack>
  );
}
