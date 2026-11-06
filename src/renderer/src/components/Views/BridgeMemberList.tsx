import { PlayerInventoryModal } from "@components/Modals/BridgeInventoryModal";
import { Paper } from "@components/Paper";
import { MinecraftAvatar } from "@components/Minecraft/MinecraftAvatar";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Input, Popover, Stack, Typography } from "@mutualzz/ui-web";
import { useInfiniteQuery } from "@tanstack/react-query";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";
import type { BridgeOnlinePlayer } from "@stores/BridgeChat.store";
import { BridgeServerCard, type BridgeServerStatus } from "./BridgeServerCard";
import { PlayerModerationModal } from "../Modals/PlayerModerationModal";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

const KNOWN_PAGE_SIZE = 50;

interface Props {
  bridgeId: string;
  spaceId?: string;
  canViewInventories?: boolean;
  serverStatuses?: BridgeServerStatus[];
  moderationServers?: string[];
}

interface BridgeKnownPlayer {
  minecraftUuid: string;
  minecraftName: string;
  servers: string[];
  lastSeenAt: string;
  online: boolean;
}

type MemberListRow =
  | { type: "heading"; key: string; label: string }
  | { type: "empty"; key: string; label: string }
  | { type: "player"; key: string; player: BridgeOnlinePlayer }
  | { type: "offline"; key: string; known: BridgeKnownPlayer };

const PlayerPopout = observer(
  ({
    player,
    onCopied,
    copied,
    lastSeenAt,
    onViewInventory,
    onKick,
    onBan
  }: {
    player: BridgeOnlinePlayer;
    copied: "name" | "uuid" | null;
    onCopied: (kind: "name" | "uuid") => void;
    lastSeenAt?: string;
    onViewInventory?: () => void;
    onKick?: () => void;
    onBan?: () => void;
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
        {(onKick || onBan) && (
          <Stack direction="row" spacing={0.75}>
            {onKick && (
              <Button size="sm" variant="soft" color="warning" onClick={onKick}>
                {t("minecraftBridge.kickFromServer")}
              </Button>
            )}
            {onBan && (
              <Button size="sm" variant="soft" color="danger" onClick={onBan}>
                {t("minecraftBridge.ban")}
              </Button>
            )}
          </Stack>
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
    onViewInventory,
    onKick,
    onBan
  }: {
    player: BridgeOnlinePlayer;
    dimmed?: boolean;
    lastSeenAt?: string;
    copied: "name" | "uuid" | null;
    onCopied: (kind: "name" | "uuid") => void;
    onViewInventory?: () => void;
    onKick?: () => void;
    onBan?: () => void;
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
          onKick={onKick}
          onBan={onBan}
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
    moderationServers
  }: Props) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const { openModal } = useModal();
    const [copied, setCopied] = useState<"name" | "uuid" | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const rawPlayers = app.bridgeChat.playersFor(bridgeId);
    const players = useMemo(
      () => [...rawPlayers].sort((a, b) => a.name.localeCompare(b.name)),
      [rawPlayers]
    );

    const visiblePlayers = useMemo(() => {
      const needle = search.toLowerCase();
      return needle
        ? players.filter((player) => player.name.toLowerCase().includes(needle))
        : players;
    }, [players, search]);

    useEffect(() => {
      const timer = setTimeout(() => setSearch(searchInput.trim()), 300);

      return () => clearTimeout(timer);
    }, [searchInput]);

    const canSeeAll = Boolean(canViewInventories && spaceId);
    const knownQuery = useInfiniteQuery({
      queryKey: ["bridges", bridgeId, "inventories", "known", search],
      queryFn: ({ pageParam }) =>
        app.rest.get<{
          players: BridgeKnownPlayer[];
          hasMore: boolean;
          total: number;
        }>(`/spaces/${spaceId}/bridge/inventories`, {
          offline: "true",
          limit: KNOWN_PAGE_SIZE,
          offset: pageParam,
          ...(search ? { q: search } : {})
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.hasMore ? pages.length * KNOWN_PAGE_SIZE : undefined,
      enabled: canSeeAll
    });

    const offlineTotal = knownQuery.data?.pages[0]?.total ?? 0;

    const offlinePlayers = useMemo(() => {
      const onlineUuids = new Set(players.map((p) => p.uuid.toLowerCase()));
      return (knownQuery.data?.pages ?? [])
        .flatMap((page) => page.players)
        .filter((p) => !onlineUuids.has(p.minecraftUuid.toLowerCase()));
    }, [knownQuery.data, players]);

    const rows = useMemo<MemberListRow[]>(() => {
      const list: MemberListRow[] = [
        {
          type: "heading",
          key: "online-heading",
          label: t("minecraftBridge.onlineCount", {
            count: visiblePlayers.length
          })
        }
      ];
      if (visiblePlayers.length === 0) {
        list.push({
          type: "empty",
          key: "online-empty",
          label: search
            ? t("minecraftBridge.playersNoResults")
            : t("minecraftBridge.onlineNone")
        });
      }
      for (const player of visiblePlayers) {
        list.push({ type: "player", key: player.uuid, player });
      }
      if (offlinePlayers.length > 0) {
        list.push({
          type: "heading",
          key: "offline-heading",
          label: t("minecraftBridge.offlineCount", { count: offlineTotal })
        });
        for (const known of offlinePlayers) {
          list.push({
            type: "offline",
            key: `offline:${known.minecraftUuid}`,
            known
          });
        }
      }
      return list;
    }, [t, visiblePlayers, offlinePlayers, search, offlineTotal]);

    const listComponents = useMemo(
      () => ({
        Header: () => (
          <BridgeServerCard
            bridgeId={bridgeId}
            statuses={serverStatuses ?? []}
          />
        )
      }),
      [bridgeId, serverStatuses]
    );

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

    const moderationAction = (
      action: "kick" | "ban",
      uuid: string,
      name: string
    ) =>
      canSeeAll && spaceId
        ? () =>
            openModal(
              "player-moderation",
              <PlayerModerationModal
                spaceId={spaceId}
                bridgeId={bridgeId}
                action={action}
                minecraftUuid={uuid}
                minecraftName={name}
              />
            )
        : undefined;

    const renderRow = (row: MemberListRow) => {
      switch (row.type) {
        case "heading":
          return (
            <Typography
              textColor="muted"
              mt={row.key === "offline-heading" ? 2 : 0}
            >
              {row.label}
            </Typography>
          );
        case "empty":
          return (
            <Typography level="body-sm" textColor="muted" mt={1}>
              {row.label}
            </Typography>
          );
        case "player":
          return (
            <PlayerRow
              player={row.player}
              copied={copied}
              onCopied={handleCopied}
              onViewInventory={inventoryAction(
                row.player.uuid,
                row.player.name
              )}
              onKick={
                moderationServers?.includes(row.player.serverId)
                  ? moderationAction("kick", row.player.uuid, row.player.name)
                  : undefined
              }
              onBan={moderationAction("ban", row.player.uuid, row.player.name)}
            />
          );
        case "offline":
          return (
            <PlayerRow
              player={{
                uuid: row.known.minecraftUuid,
                name: row.known.minecraftName,
                serverId: row.known.servers[0] ?? "",
                linkedUser: null
              }}
              dimmed
              lastSeenAt={row.known.lastSeenAt}
              copied={copied}
              onCopied={handleCopied}
              onViewInventory={inventoryAction(
                row.known.minecraftUuid,
                row.known.minecraftName
              )}
              onBan={moderationAction(
                "ban",
                row.known.minecraftUuid,
                row.known.minecraftName
              )}
            />
          );
      }
    };

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
        <div
          css={{
            marginBottom: 8
          }}
        >
          <Input
            size="sm"
            fullWidth
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("minecraftBridge.playersSearch")}
            startDecorator={<MagnifyingGlassIcon />}
            type="text"
          />
        </div>
        <Virtuoso
          style={{ flex: 1, minHeight: 0 }}
          data={rows}
          computeItemKey={(_, row) => row.key}
          increaseViewportBy={200}
          components={listComponents}
          endReached={() => {
            if (knownQuery.hasNextPage && !knownQuery.isFetchingNextPage) {
              void knownQuery.fetchNextPage();
            }
          }}
          itemContent={(_, row) => (
            <div style={{ paddingBottom: 2 }}>{renderRow(row)}</div>
          )}
        />
      </Paper>
    );
  }
);
