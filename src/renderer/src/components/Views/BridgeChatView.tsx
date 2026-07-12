import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { BridgeFeedEntry } from "@stores/BridgeChat.store";
import { Input, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

export const BridgeChatView = observer(({ bridgeId }: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const feedRef = useRef<HTMLDivElement | null>(null);
  const sendingRef = useRef(false);
  const loadingOlderRef = useRef(false);
  const stickToBottomRef = useRef(true);

  const bridgesQuery = useQuery({
    queryKey: ["me", "bridges", bridgeId],
    queryFn: () => app.rest.get<BridgeDetail>(`/@me/bridges/${bridgeId}`),
    refetchInterval: 15_000,
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

  // Ack when viewing
  useEffect(() => {
    const last = entries.filter((e) => !e.pending && !e.failed).at(-1);
    if (!last) return;
    const state = app.bridgeChat.unreadFor(bridgeId);
    if (state?.lastAckedId === last.id) return;
    app.bridgeChat.markAcked(bridgeId, last.id);
    void app.rest
      .post(`/@me/bridges/${bridgeId}/ack`, { lastAckedId: last.id })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["me", "bridges"] });
      })
      .catch(() => undefined);
  }, [bridgeId, entries.length, app, queryClient]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [entries.length]);

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
    const el = feedRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      const older = await app.rest.get<BridgeFeedEntry[]>(
        `/@me/bridges/${bridgeId}/messages?limit=50&before=${encodeURIComponent(oldest.id)}`,
      );
      app.bridgeChat.prepend(bridgeId, older);
      requestAnimationFrame(() => {
        if (!el) return;
        el.scrollTop = el.scrollHeight - prevHeight;
      });
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
          <div
            ref={feedRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              stickToBottomRef.current =
                el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              if (el.scrollTop < 40) void loadOlder();
            }}
            css={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              padding: "8px 8px 8px",
            }}
          >
            {entries.length === 0 ? (
              <Stack p={2.5} direction="column" spacing={1}>
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
              <>
                <div
                  aria-hidden
                  css={{ flex: "1 1 auto", minHeight: 0, pointerEvents: "none" }}
                />
                {entries.map((entry, i) => {
                  const prev = entries[i - 1];
                  const prevDay = prev ? new Date(prev.at) : null;
                  const day = new Date(entry.at);
                  const showDate =
                    Number.isFinite(day.getTime()) &&
                    (!prevDay ||
                      !Number.isFinite(prevDay.getTime()) ||
                      prevDay.toDateString() !== day.toDateString());

                  return (
                    <Fragment key={entry.id}>
                      {showDate && <BridgeDateSeparator date={day} />}
                      <BridgeMessage
                        entry={entry}
                        header={shouldStartBridgeGroup(prev, entry)}
                      />
                    </Fragment>
                  );
                })}
              </>
            )}
          </div>

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
                css={{ flex: 1, minWidth: 0, border: "none", background: "transparent" }}
              />
            </Paper>
          </Stack>
        </Stack>
        {app.memberListVisible && <BridgeMemberList bridgeId={bridgeId} />}
      </Stack>
    </Stack>
  );
});
