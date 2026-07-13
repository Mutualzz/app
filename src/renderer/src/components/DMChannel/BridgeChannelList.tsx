import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CubeIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

interface BridgeSummary {
  id: string;
  name: string;
  hubConnected?: boolean;
  onlineCount?: number;
  unread?: boolean;
  lastMessageId?: string | null;
  lastAckedId?: string | null;
  status?: number;
  role?: "owner" | "member";
}

export const BridgeChannelList = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { bridgeId?: string };

  const bridgesQuery = useQuery({
    queryKey: ["me", "bridges"],
    queryFn: () => app.rest.get<BridgeSummary[]>("/@me/bridges"),
    // Online count / unread come from gateway; slow poll for hubConnected.
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const bridges = bridgesQuery.data ?? [];

  useEffect(() => {
    if (!bridgesQuery.data) return;
    app.bridgeChat.setUnreadFromList(bridgesQuery.data);
  }, [bridgesQuery.data, app.bridgeChat]);

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 4 : 0}
      direction="column"
      width="100%"
      spacing={1.25}
      borderBottom="0 !important"
      borderRight="0 !important"
      borderLeft="0 !important"
      position="relative"
      p={2.5}
      flex={1}
      overflow="auto"
    >
      <Typography level="label-xs">
        {t("minecraftBridge.yourBridges")}
      </Typography>
      {bridges.length === 0 ? (
        <Typography
          level="body-sm"
          textColor="secondary"
          textAlign="center"
          mt={2}
        >
          {t("minecraftBridge.sidebarEmpty")}
        </Typography>
      ) : (
        bridges.map((bridge) => {
          const active = params.bridgeId === bridge.id;
          const stored = app.bridgeChat.playersByBridge.get(bridge.id);
          const onlineCount =
            stored !== undefined
              ? stored.length
              : (bridge.onlineCount ?? 0);
          const unread =
            app.bridgeChat.unreadFor(bridge.id)?.unread ??
            Boolean(bridge.unread);

          const statusLabel = !bridge.hubConnected
            ? t("minecraftBridge.hubDisconnected")
            : onlineCount === 0
              ? t("minecraftBridge.onlineNone")
              : t("minecraftBridge.onlineCount", { count: onlineCount });

          return (
            <Paper
              key={bridge.id}
              variant={active ? "soft" : "plain"}
              width="100%"
              direction="row"
              borderRadius={10}
              px={1}
              py={0.75}
              alignItems="center"
              spacing={1.25}
              css={{ cursor: "pointer" }}
              onClick={() =>
                navigate({
                  to: "/@me/bridges/$bridgeId",
                  params: { bridgeId: bridge.id },
                })
              }
            >
              <CubeIcon size={22} weight={active ? "fill" : "regular"} />
              <Stack direction="column" spacing={0} minWidth={0} flex={1}>
                <Typography
                  level="body-sm"
                  fontWeight={active || unread ? "bold" : undefined}
                  css={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {bridge.name}
                  {bridge.role === "member"
                    ? ` · ${t("minecraftBridge.roleMember")}`
                    : ""}
                </Typography>
                <Typography level="body-xs" textColor="muted">
                  {statusLabel}
                </Typography>
              </Stack>
              {unread && !active && (
                <Stack
                  css={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: "var(--mui-palette-primary-main, #5865f2)",
                    flexShrink: 0,
                  }}
                />
              )}
            </Paper>
          );
        })
      )}
    </Paper>
  );
});
