import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { CubeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface BridgeSummary {
  id: string;
  name: string;
  spaceId?: string;
  hubConnected?: boolean;
  onlineCount?: number;
  unread?: boolean;
  role?: "admin" | "member";
}

export const Route = createFileRoute("/_authenticated/@me/bridges/")({
  component: observer(RouteComponent)
});

function RouteComponent() {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const bridgesQuery = useQuery({
    queryKey: ["me", "bridges"],
    queryFn: () => app.rest.get<BridgeSummary[]>("/@me/bridges")
  });

  const bridges = bridgesQuery.data ?? [];

  const grouped = useMemo(() => {
    const groups = new Map<string, BridgeSummary[]>();
    for (const bridge of bridges) {
      const key = bridge.spaceId ?? "";
      const list = groups.get(key) ?? [];
      list.push(bridge);
      groups.set(key, list);
    }
    return [...groups.entries()].sort(([a], [b]) => {
      const aName = app.spaces.get(a)?.name ?? a;
      const bName = app.spaces.get(b)?.name ?? b;
      return aName.localeCompare(bName);
    });
  }, [app.spaces, bridges]);

  if (bridgesQuery.isLoading) {
    return null;
  }

  if (bridges.length === 0) {
    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 3 : 0}
        direction="column"
        flex="1 1 auto"
        overflow="hidden"
        borderLeft="0 !important"
        borderRight="0 !important"
        borderBottom="0 !important"
        alignItems="center"
        justifyContent="center"
        spacing={2}
        p={4}
      >
        <CubeIcon size={40} />
        <Stack
          direction="column"
          spacing={1}
          alignItems="center"
          maxWidth={360}
        >
          <Typography level="title-md" fontWeight="bold" textAlign="center">
            {t("minecraftBridge.sidebarEmptyTitle")}
          </Typography>
          <Typography level="body-sm" textColor="muted" textAlign="center">
            {t("minecraftBridge.sidebarEmpty")}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 3 : 0}
      direction="column"
      flex="1 1 auto"
      overflow="auto"
      borderLeft="0 !important"
      borderRight="0 !important"
      borderBottom="0 !important"
      spacing={2}
      p={4}
    >
      <Typography level="title-md" fontWeight="bold">
        {t("minecraftBridge.yourBridges")}
      </Typography>
      {grouped.map(([groupSpaceId, groupBridges]) => (
        <Stack key={groupSpaceId || "unknown"} direction="column" spacing={1}>
          <Typography level="label-sm" textColor="muted">
            {app.spaces.get(groupSpaceId)?.name ??
              t("minecraftBridge.unknownSpace")}
          </Typography>
          {groupBridges.map((bridge) => {
            const unread =
              app.bridgeChat.unreadFor(bridge.id)?.unread ??
              Boolean(bridge.unread);
            return (
              <Paper
                key={bridge.id}
                variant="plain"
                direction="row"
                alignItems="center"
                spacing={1.25}
                borderRadius={10}
                px={1.25}
                py={1}
                css={{ cursor: "pointer" }}
                onClick={() => {
                  if (bridge.spaceId) {
                    navigate({
                      to: "/spaces/$spaceId/bridges/$bridgeId",
                      params: {
                        spaceId: bridge.spaceId,
                        bridgeId: bridge.id
                      }
                    });
                    return;
                  }
                  navigate({
                    to: "/@me/bridges/$bridgeId",
                    params: { bridgeId: bridge.id }
                  });
                }}
              >
                <CubeIcon size={22} weight={unread ? "fill" : "regular"} />
                <Stack direction="column" spacing={0} minWidth={0} flex={1}>
                  <Typography
                    level="body-sm"
                    fontWeight={unread ? "bold" : undefined}
                  >
                    {bridge.name}
                  </Typography>
                </Stack>
                {unread && (
                  <Stack
                    css={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: theme.colors.primary,
                      flexShrink: 0
                    }}
                  />
                )}
              </Paper>
            );
          })}
        </Stack>
      ))}
    </Paper>
  );
}
