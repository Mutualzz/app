import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { BridgeFeedEntry } from "@stores/BridgeChat.store";
import { Input, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { BridgeChatHeader } from "./BridgeChatHeader";
import { BridgeDateSeparator } from "./BridgeDateSeparator";
import { BridgeMemberList } from "./BridgeMemberList";
import { BridgeMessage, shouldStartBridgeGroup } from "./BridgeMessage";

interface BridgeDetail {
  id: string;
  name: string;
  hubConnected?: boolean;
  lastMessageId?: string | null;
  lastAckedId?: string | null;
  unread?: boolean;
  onlinePlayers?: {
    uuid: string;
    name: string;
    serverId: string;
    linkedUser?: {
      id: string;
      username: string;
      globalName?: string | null;
      avatar?: string | null;
    } | null;
  }[];
}

interface Props {
  bridgeId: string;
}

type FeedRow =
  | { type: "date"; key: string; date: Date }
  | { type: "message"; key: string; entry: BridgeFeedEntry; header: boolean };

function buildFeedRows(entries: BridgeFeedEntry[]): FeedRow[] {
  const rows: FeedRow[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const prev = entries[i - 1];
    const prevDay = prev ? new Date(prev.at) : null;
    const day = new Date(entry.at);
    const showDate =
      Number.isFinite(day.getTime()) &&
      (!prevDay ||
        !Number.isFinite(prevDay.getTime()) ||
        prevDay.toDateString() !== day.toDateString());

    if (showDate) {
      rows.push({
        type: "date",
        key: `date:${day.toDateString()}:${entry.id}`,
        date: day,
      });
    }
    rows.push({
      type: "message",
      key: entry.id,
      entry,
      header: shouldStartBridgeGroup(prev, entry),
    });
  }
  return rows;
}

export const BridgeChatView = observer(({ bridgeId }: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const sendingRef = useRef(false);
  const loadingOlderRef = useRef(false);
  const stickToBottomRef = useRef(true);
  const ackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAckedRef = useRef<string | null>(null);

  const bridgesQuery = useQuery({
    queryKey: ["me", "bridges", bridgeId],
    queryFn: () => app.rest.get<BridgeDetail>(`/@me/bridges/${bridgeId}`),
    // Gateway covers live chat/players; slow poll only for hubConnected.
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const historyQuery = useQuery({
    queryKey: ["me", "bridges", bridgeId, "messages"],
    queryFn: () =>
      app.rest.get<BridgeFeedEntry[]>(
        `/@me/bridges/${bridgeId}/messages?limit=100`,
      ),
  });

  const bridge = bridgesQuery.data;
  const hubConnected = bridge?.hubConnected === true;
  const entries = app.bridgeChat.entriesFor(bridgeId);
  const players = app.bridgeChat.playersFor(bridgeId);
  const rows = useMemo(() => buildFeedRows(entries), [entries]);

  useEffect(() => {
    app.pushComposer();
    return () => app.popComposer();
  }, [app]);

  useEffect(() => {
    if (!historyQuery.data) return;
    app.bridgeChat.hydrate(bridgeId, historyQuery.data);
  }, [bridgeId, historyQuery.data, app.bridgeChat]);

  useEffect(() => {
    if (!bridge?.onlinePlayers) return;
    app.bridgeChat.setPlayers(bridgeId, bridge.onlinePlayers);
  }, [bridgeId, bridge?.onlinePlayers, app.bridgeChat]);

  useEffect(() => {
    if (!bridge) return;
    app.bridgeChat.setUnread(bridgeId, {
      lastMessageId: bridge.lastMessageId ?? null,
      lastAckedId: bridge.lastAckedId ?? null,
      unread: Boolean(bridge.unread),
    });
  }, [bridge, bridgeId, app.bridgeChat]);

  // Debounced ack — patch local cache only (never invalidate all bridge queries).
  useEffect(() => {
    const last = entries.filter((e) => !e.pending && !e.failed).at(-1);
    if (!last) return;
    const state = app.bridgeChat.unreadFor(bridgeId);
    if (state?.lastAckedId === last.id || lastAckedRef.current === last.id) {
      return;
    }

    if (ackTimerRef.current) clearTimeout(ackTimerRef.current);
    ackTimerRef.current = setTimeout(() => {
      lastAckedRef.current = last.id;
      app.bridgeChat.markAcked(bridgeId, last.id);

      const patchUnread = <T extends { lastAckedId?: string | null; unread?: boolean }>(
        old: T | undefined,
      ): T | undefined => {
        if (!old) return old;
        return { ...old, lastAckedId: last.id, unread: false };
      };

      queryClient.setQueryData<BridgeDetail>(
        ["me", "bridges", bridgeId],
        (old) => patchUnread(old),
      );
      queryClient.setQueryData<
        { id: string; lastAckedId?: string | null; unread?: boolean }[]
      >(["me", "bridges"], (old) =>
        old?.map((b) => (b.id === bridgeId ? { ...b, lastAckedId: last.id, unread: false } : b)),
      );

      void app.rest
        .post(`/@me/bridges/${bridgeId}/ack`, { lastAckedId: last.id })
        .catch(() => undefined);
    }, 750);

    return () => {
      if (ackTimerRef.current) clearTimeout(ackTimerRef.current);
    };
  }, [bridgeId, entries.length, app, queryClient]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      app.rest.post<BridgeFeedEntry>(`/@me/bridges/${bridgeId}/chat`, {
        content,
      }),
  });

  const flushQueue = useCallback(async () => {
    if (!hubConnected) return;
    const queued = app.bridgeChat.takeQueueFor(bridgeId);
    for (const item of queued) {
      try {
        const payload = await app.rest.post<BridgeFeedEntry>(
          `/@me/bridges/${bridgeId}/chat`,
          { content: item.content },
        );
        app.bridgeChat.resolvePending(item.localId, bridgeId, {
          ...payload,
          kind: "chat",
        });
      } catch {
        app.bridgeChat.requeue(item);
      }
    }
  }, [app, bridgeId, hubConnected]);

  useEffect(() => {
    if (hubConnected) void flushQueue();
  }, [hubConnected, flushQueue]);

  const loadOlder = useCallback(async () => {
    if (loadingOlderRef.current || !app.bridgeChat.hasMore(bridgeId)) return;
    const oldest = entries[0];
    if (!oldest) return;
    loadingOlderRef.current = true;
    try {
      const older = await app.rest.get<BridgeFeedEntry[]>(
        `/@me/bridges/${bridgeId}/messages?limit=50&before=${encodeURIComponent(oldest.id)}`,
      );
      app.bridgeChat.prepend(bridgeId, older);
    } catch {
      // ignore
    } finally {
      loadingOlderRef.current = false;
    }
  }, [app, bridgeId, entries]);

  const send = () => {
    const content = message.trim();
    if (!content || sendingRef.current || sendMutation.isPending) return;

    if (!hubConnected) {
      app.bridgeChat.enqueueSend(bridgeId, content);
      setMessage("");
      return;
    }

    sendingRef.current = true;
    sendMutation.mutate(content, {
      onSuccess: (payload) => {
        app.bridgeChat.add({ ...payload, kind: "chat" });
        setMessage("");
      },
      onError: () => {
        app.bridgeChat.enqueueSend(bridgeId, content);
        setMessage("");
      },
      onSettled: () => {
        sendingRef.current = false;
      },
    });
  };

  if (!bridge && bridgesQuery.isFetched) {
    return (
      <Stack p={4}>
        <Typography level="body-md" textColor="muted">
          {t("minecraftBridge.selectBridgeFirst")}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="column"
      width="100%"
      height="100%"
      overflow="hidden"
      minWidth={0}
    >
      <BridgeChatHeader
        name={bridge?.name ?? t("minecraftBridge.liveTitle")}
        onlineCount={players.length}
        hubConnected={hubConnected}
      />
      <Stack direction="row" flex="1 1 auto" overflow="hidden" minWidth={0}>
        <Stack
          direction="column"
          flex="1 1 auto"
          position="relative"
          overflow="hidden"
          minWidth={0}
        >
          {!hubConnected && (
            <Paper
              variant="soft"
              color="warning"
              mx={1.5}
              mt={1}
              px={1.5}
              py={1}
              borderRadius={8}
            >
              <Typography level="body-sm">
                {t("minecraftBridge.hubWaitingBanner")}
              </Typography>
            </Paper>
          )}
          {entries.length === 0 ? (
            <Stack p={2.5} direction="column" spacing={1} flex={1}>
              <Typography level="title-md" fontWeight="bold">
                {t("minecraftBridge.liveWelcomeTitle", {
                  name: bridge?.name ?? "",
                })}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {!hubConnected
                  ? t("minecraftBridge.hubWaitingBanner")
                  : t("minecraftBridge.liveEmpty")}
              </Typography>
            </Stack>
          ) : (
            <Virtuoso
              ref={virtuosoRef}
              style={{ flex: 1, minWidth: 0 }}
              data={rows}
              computeItemKey={(_, row) => row.key}
              alignToBottom
              followOutput={() => (stickToBottomRef.current ? "smooth" : false)}
              atBottomStateChange={(atBottom) => {
                stickToBottomRef.current = atBottom;
              }}
              startReached={() => {
                void loadOlder();
              }}
              increaseViewportBy={{ top: 400, bottom: 200 }}
              itemContent={(_, row) =>
                row.type === "date" ? (
                  <BridgeDateSeparator date={row.date} />
                ) : (
                  <BridgeMessage entry={row.entry} header={row.header} />
                )
              }
            />
          )}

          <Stack px={1.25} pb={1.25} flexShrink={0} minWidth={0}>
            <Paper
              elevation={app.settings?.preferEmbossed ? 5 : 1}
              px={1.5}
              py={0.75}
              borderRadius={6}
              direction="row"
              alignItems="center"
              spacing={1}
              width="100%"
              css={{
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              <Input
                value={message}
                placeholder={
                  hubConnected
                    ? t("minecraftBridge.liveSendPlaceholder")
                    : t("minecraftBridge.queueSendPlaceholder")
                }
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={sendMutation.isPending}
                css={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  background: "transparent",
                }}
              />
            </Paper>
          </Stack>
        </Stack>
        {app.memberListVisible && <BridgeMemberList bridgeId={bridgeId} />}
      </Stack>
    </Stack>
  );
});
