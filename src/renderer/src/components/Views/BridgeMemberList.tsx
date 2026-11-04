import { PlayerInventoryModal } from "@components/Modals/BridgeInventoryModal";
import { Paper } from "@components/Paper";
import { MinecraftAvatar } from "@components/Minecraft/MinecraftAvatar";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Popover, Stack, Typography } from "@mutualzz/ui-web";
import { useQuery } from "@tanstack/react-query";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { BridgeOnlinePlayer } from "@stores/BridgeChat.store";
import {
  BridgeServerCard,
  type BridgeServerInfo,
  type BridgeServerStatus
} from "./BridgeServerCard";

interface Props {
  bridgeId: string;
  spaceId?: string;
  canViewInventories?: boolean;
  serverStatuses?: BridgeServerStatus[];
  servers?: BridgeServerInfo[];
}

interface BridgeKnownPlayer {
  minecraftUuid: string;
  minecraftName: string;
  servers: string[];
  lastSeenAt: string;
  online: boolean;
}

const PlayerPopout = observer(
  ({
    player,
    onCopied,
    copied,
    lastSeenAt,
    onViewInventory
  }: {
    player: BridgeOnlinePlayer;
    copied: "name" | "uuid" | null;
    onCopied: (kind: "name" | "uuid") => void;
    lastSeenAt?: string;
    onViewInventory?: () => void;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const linkedUser =
      player.linkedUser?.id != null
        ? (app.users.get(player.linkedUser.id) ?? null)
        : null;

    const copy = async (value: string, kind: "name" | "uuid") => {
      try {
        if (isElectron) await window.api.clipboard.write(value);
        else await navigator.clipboard.writeText(value);
        onCopied(kind);
      } catch {
        // ignore
      }
    };

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 2}
        direction="column"
        spacing={1}
        p={1.5}
        borderRadius={10}
        minWidth={220}
        maxWidth={280}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          {linkedUser ? (
            <UserAvatar user={linkedUser} size={40} />
          ) : (
            <MinecraftAvatar uuid={player.uuid} name={player.name} size={40} />
          )}
          <Stack direction="column" spacing={0} minWidth={0}>
            <Typography level="body-sm" fontWeight="bold">
              {player.name}
            </Typography>
            {player.linkedUser && (
              <Typography level="body-xs" textColor="muted">
                {t("minecraftBridge.linkedMutualzz", {
                  name:
                    player.linkedUser.globalName || player.linkedUser.username
                })}
              </Typography>
            )}
            {lastSeenAt && (
              <Typography level="body-xs" textColor="muted">
                {t("minecraftBridge.playersLastSeen", {
                  time: new Date(lastSeenAt).toLocaleString()
                })}
              </Typography>
            )}
          </Stack>
        </Stack>
        <Typography
          level="body-xs"
          textColor="muted"
          css={{ wordBreak: "break-all" }}
        >
          {player.uuid}
        </Typography>
        <Stack direction="row" spacing={0.75}>
          <Button
            size="sm"
            variant="soft"
            onClick={(event) => {
              event.stopPropagation();
              void copy(player.name, "name");
            }}
          >
            {copied === "name"
              ? t("minecraftBridge.copied")
              : t("minecraftBridge.copyName")}
          </Button>
          <Button
            size="sm"
            variant="soft"
            onClick={(event) => {
              event.stopPropagation();
              void copy(player.uuid, "uuid");
            }}
          >
            {copied === "uuid"
              ? t("minecraftBridge.copied")
              : t("minecraftBridge.copyUuid")}
          </Button>
        </Stack>
        {onViewInventory && (
          <Button
            size="sm"
            variant="soft"
            color="primary"
            onClick={onViewInventory}
          >
            {t("minecraftBridge.inventoryView")}
          </Button>
        )}
      </Paper>
    );
  }
);

const PlayerRow = observer(
  ({
    player,
    dimmed,
    lastSeenAt,
    copied,
    onCopied,
    onViewInventory
  }: {
    player: BridgeOnlinePlayer;
    dimmed?: boolean;
    lastSeenAt?: string;
    copied: "name" | "uuid" | null;
    onCopied: (kind: "name" | "uuid") => void;
    onViewInventory?: () => void;
  }) => {
    const app = useAppStore();
    const linked =
      player.linkedUser?.id != null
        ? app.users.get(player.linkedUser.id)
        : null;

    return (
      <Popover
        placement="left"
        closeOnClickOutside
        closeOnInteract
        variant="plain"
        elevation={0}
        css={{
          padding: 0,
          background: "transparent",
          boxShadow: "none",
          overflow: "visible"
        }}
        trigger={
          <Paper
            variant="plain"
            direction="row"
            alignItems="center"
            spacing={1.25}
            px={1}
            py={0.75}
            borderRadius={8}
            width="100%"
            css={{ cursor: "pointer", opacity: dimmed ? 0.5 : 1 }}
          >
            {linked ? (
              <UserAvatar user={linked} size={28} />
            ) : (
              <MinecraftAvatar
                uuid={player.uuid}
                name={player.name}
                size={28}
              />
            )}
            <Typography
              level="body-sm"
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
                flex: 1
              }}
            >
              {player.name}
            </Typography>
          </Paper>
        }
      >
        <PlayerPopout
          player={player}
          copied={copied}
          onCopied={onCopied}
          lastSeenAt={lastSeenAt}
          onViewInventory={onViewInventory}
        />
      </Popover>
    );
  }
);

export const BridgeMemberList = observer(
  ({
    bridgeId,
    spaceId,
    canViewInventories,
    serverStatuses,
    servers
  }: Props) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const { openModal } = useModal();
    const [copied, setCopied] = useState<"name" | "uuid" | null>(null);
    const rawPlayers = app.bridgeChat.playersFor(bridgeId);
    const players = useMemo(
      () => [...rawPlayers].sort((a, b) => a.name.localeCompare(b.name)),
      [rawPlayers]
    );

    const canSeeAll = Boolean(canViewInventories && spaceId);
    const knownQuery = useQuery({
      queryKey: ["bridges", bridgeId, "inventories", "known"],
      queryFn: () =>
        app.rest.get<BridgeKnownPlayer[]>(
          `/spaces/${spaceId}/bridge/inventories`
        ),
      enabled: canSeeAll
    });

    const offlinePlayers = useMemo(() => {
      const onlineUuids = new Set(players.map((p) => p.uuid.toLowerCase()));
      return (knownQuery.data ?? [])
        .filter((p) => !onlineUuids.has(p.minecraftUuid.toLowerCase()))
        .sort((a, b) => a.minecraftName.localeCompare(b.minecraftName));
    }, [knownQuery.data, players]);

    const handleCopied = (kind: "name" | "uuid") => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    };

    const inventoryAction = (uuid: string, name: string) =>
      canSeeAll && spaceId
        ? () =>
            openModal(
              "bridge-inventory",
              <PlayerInventoryModal
                bridgeId={bridgeId}
                spaceId={spaceId}
                minecraftUuid={uuid}
                minecraftName={name}
              />
            )
        : undefined;

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 0}
        direction="column"
        flex="0 0 240px"
        overflowX="hidden"
        borderTop="0 !important"
        borderRight="0 !important"
        borderBottom="0 !important"
        px={1.75}
        py={1.25}
      >
        <Stack
          direction="column"
          flex="1 1 auto"
          overflowY="auto"
          spacing={0.25}
        >
          <BridgeServerCard
            bridgeId={bridgeId}
            statuses={serverStatuses ?? []}
            servers={servers ?? []}
          />

          <Typography textColor="muted">
            {t("minecraftBridge.onlineCount", { count: players.length })}
          </Typography>
          {players.length === 0 ? (
            <Typography level="body-sm" textColor="muted" mt={1}>
              {t("minecraftBridge.onlineNone")}
            </Typography>
          ) : (
            players.map((player) => (
              <PlayerRow
                key={player.uuid}
                player={player}
                copied={copied}
                onCopied={handleCopied}
                onViewInventory={inventoryAction(player.uuid, player.name)}
              />
            ))
          )}

          {offlinePlayers.length > 0 && (
            <>
              <Typography textColor="muted" mt={2}>
                {t("minecraftBridge.offlineCount", {
                  count: offlinePlayers.length
                })}
              </Typography>
              {offlinePlayers.map((known) => (
                <PlayerRow
                  key={known.minecraftUuid}
                  player={{
                    uuid: known.minecraftUuid,
                    name: known.minecraftName,
                    serverId: known.servers[0] ?? "",
                    linkedUser: null
                  }}
                  dimmed
                  lastSeenAt={known.lastSeenAt}
                  copied={copied}
                  onCopied={handleCopied}
                  onViewInventory={inventoryAction(
                    known.minecraftUuid,
                    known.minecraftName
                  )}
                />
              ))}
            </>
          )}
        </Stack>
      </Paper>
    );
  }
);
