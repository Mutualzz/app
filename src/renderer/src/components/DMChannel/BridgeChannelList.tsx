import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { IconSlot, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CubeIcon } from "@phosphor-icons/react";
import { useEffect, useMemo } from "react";
import { useModal } from "@contexts/Modal.context";
import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal";
import { UnreadIndicator } from "../UnreadIndicator";
import { Tooltip } from "../Tooltip";

interface BridgeSummary {
  id: string;
  name: string;
  spaceId?: string;
  hubConnected?: boolean;
  onlineCount?: number;
  unread?: boolean;
  lastMessageId?: string | null;
  lastAckedId?: string | null;
  status?: number;
  role?: "admin" | "member";
}

interface BridgeChannelListProps {
  spaceId?: string;
}

export const BridgeChannelList = observer(
  ({ spaceId }: BridgeChannelListProps) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { openModal } = useModal();
    const params = useParams({ strict: false });

    const bridgesQuery = useQuery({
      queryKey: ["me", "bridges"],
      queryFn: () => app.rest.get<BridgeSummary[]>("/@me/bridges"),
      staleTime: 30_000,
      refetchInterval: 60_000
    });

    const bridges = useMemo(() => {
      const all = bridgesQuery.data ?? [];
      if (!spaceId) return all;
      return all.filter((bridge) => bridge.spaceId === spaceId);
    }, [bridgesQuery.data, spaceId]);

    const grouped = useMemo(() => {
      if (spaceId) return null;
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
    }, [app.spaces, bridges, spaceId]);

    useEffect(() => {
      if (!bridgesQuery.data) return;
      app.bridgeChat.setUnreadFromList(bridgesQuery.data);
    }, [bridgesQuery.data, app.bridgeChat]);

    const space = spaceId ? app.spaces.get(spaceId) : null;
    const canManageBridge = !!space?.members.me?.hasPermission("ManageSpace");

    const openBridge = (bridge: BridgeSummary) => {
      const targetSpaceId = spaceId ?? bridge.spaceId;
      if (!targetSpaceId) return;

      navigate({
        to: "/spaces/$spaceId/bridges/$bridgeId",
        params: { spaceId: targetSpaceId, bridgeId: bridge.id }
      });
    };

    const openSettings = () => {
      if (!space) return;
      openModal(
        `space-settings-${space.id}`,
        <SpaceSettingsModal space={space} redirectTo="minecraft-bridge" />
      );
    };

    const renderBridgeRow = (bridge: BridgeSummary) => {
      const active = params.bridgeId === bridge.id;
      const stored = app.bridgeChat.playersByBridge.get(bridge.id);
      const onlineCount =
        stored !== undefined ? stored.length : (bridge.onlineCount ?? 0);
      const unread =
        app.bridgeChat.unreadFor(bridge.id)?.unread ?? Boolean(bridge.unread);

      const statusLabel = !bridge.hubConnected
        ? t("minecraftBridge.hubDisconnected")
        : onlineCount === 0
          ? t("minecraftBridge.onlineNone")
          : t("minecraftBridge.onlineCount", { count: onlineCount });

      const tooltipLabel =
        bridge.role === "member"
          ? `${statusLabel} · ${t("minecraftBridge.roleMember")}`
          : statusLabel;

      return (
        <Tooltip key={bridge.id} content={tooltipLabel} placement="right">
          <Stack
            ml={1.5}
            mr={2.5}
            px={1.5}
            direction="column"
            css={{
              cursor: "pointer",
              ...(!bridge.hubConnected && !active && { opacity: 0.5 })
            }}
            onClick={() => openBridge(bridge)}
          >
            <Paper
              width="100%"
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              borderRadius={6}
              px={1.5}
              py={1}
              minHeight={28}
              variant={active ? "soft" : "plain"}
              surfaceRole={
                active && theme.backgroundImageUrl ? "card" : undefined
              }
              color={active ? theme.typography.colors.primary : undefined}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                flex={1}
                minWidth={0}
              >
                <IconSlot size={16}>
                  <CubeIcon weight={active ? "fill" : "regular"} />
                </IconSlot>
                <Typography
                  level="label-sm"
                  textColor="secondary"
                  weight={unread || active ? 700 : 600}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  css={{ minWidth: 0 }}
                >
                  {bridge.name}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                {bridge.hubConnected && onlineCount > 0 && (
                  <Typography
                    level="label-xs"
                    textColor="muted"
                    css={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {onlineCount}
                  </Typography>
                )}
                <UnreadIndicator mentionCount={0} unread={unread && !active} />
              </Stack>
            </Paper>
          </Stack>
        </Tooltip>
      );
    };

    return (
      <Stack
        direction="column"
        width="100%"
        position="relative"
        pt="1rem"
        flex={1}
        overflow="auto"
      >
        {!spaceId && (
          <Typography level="label-xs">
            {t("minecraftBridge.yourBridges")}
          </Typography>
        )}
        {bridges.length === 0 ? (
          <Stack
            direction="column"
            spacing={1.5}
            alignItems="center"
            mt={2}
            px={2.5}
          >
            <Typography
              level="body-sm"
              textColor="secondary"
              textAlign="center"
            >
              {spaceId
                ? canManageBridge
                  ? t("minecraftBridge.noBridgesAdmin")
                  : t("minecraftBridge.noBridgesMember")
                : t("minecraftBridge.sidebarEmpty")}
            </Typography>
            {spaceId && canManageBridge && (
              <Button size="sm" variant="soft" onClick={openSettings}>
                {t("minecraftBridge.openSpaceSettings")}
              </Button>
            )}
          </Stack>
        ) : grouped ? (
          grouped.map(([groupSpaceId, groupBridges]) => (
            <Stack
              key={groupSpaceId || "unknown"}
              direction="column"
              spacing={1}
            >
              <Typography level="label-xs" textColor="muted">
                {app.spaces.get(groupSpaceId)?.name ??
                  t("minecraftBridge.unknownSpace")}
              </Typography>
              {groupBridges.map(renderBridgeRow)}
            </Stack>
          ))
        ) : (
          bridges.map(renderBridgeRow)
        )}
      </Stack>
    );
  }
);
