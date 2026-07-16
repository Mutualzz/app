import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CubeIcon } from "@phosphor-icons/react";
import { useEffect, useMemo } from "react";
import { useModal } from "@contexts/Modal.context";
import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal";

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
    const navigate = useNavigate();
    const { openModal } = useModal();
    const params = useParams({ strict: false }) as { bridgeId?: string };

    const bridgesQuery = useQuery({
      queryKey: ["me", "bridges"],
      queryFn: () => app.rest.get<BridgeSummary[]>("/@me/bridges"),
      staleTime: 30_000,
      refetchInterval: 60_000,
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
      if (spaceId || bridge.spaceId) {
        const targetSpaceId = spaceId ?? bridge.spaceId!;
        navigate({
          to: "/spaces/$spaceId/bridges/$bridgeId",
          params: { spaceId: targetSpaceId, bridgeId: bridge.id },
        });
        return;
      }
      navigate({
        to: "/@me/bridges/$bridgeId",
        params: { bridgeId: bridge.id },
      });
    };

    const openSettings = () => {
      if (!space) return;
      openModal(
        `space-settings-${space.id}`,
        <SpaceSettingsModal space={space} redirectTo="minecraft-bridge" />,
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
          onClick={() => openBridge(bridge)}
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
    };

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
        {!spaceId && (
          <Typography level="label-xs">
            {t("minecraftBridge.yourBridges")}
          </Typography>
        )}
        {bridges.length === 0 ? (
          <Stack direction="column" spacing={1.5} alignItems="center" mt={2}>
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
            <Stack key={groupSpaceId || "unknown"} direction="column" spacing={1}>
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
      </Paper>
    );
  },
);
