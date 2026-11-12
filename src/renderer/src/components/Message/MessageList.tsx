import { Paper } from "@components/Paper";
import { MessageListSkeleton } from "@components/Skeletons";
import { Logger } from "@mutualzz/logger";
import { Avatar, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { MessageGroup as MessageGroupType } from "@stores/Message.store";
import type { Channel } from "@stores/objects/Channel";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  useMemo
} from "react";
import useResizeObserver from "use-resize-observer";
import { MessageDateSeparator } from "@components/Message/MessageDateSeparator";
import { MessageGroup } from "@components/Message/MessageGroup";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { HashIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { jumpToChannelMessage } from "@utils/jumpToChannelMessage";
import { useMenu } from "@renderer/contexts/ContextMenu.context";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";

interface Props {
  channel?: Channel | null;
}

export const MessageAreaWidthContext = createContext(0);
export const MESSAGE_AREA_PADDING = 82;

const LIMIT = 50;

// Arbitrary large number for infinite scroll to start from the bottom of the list
const START_INDEX = 1_000_000;

const RETAINED_MESSAGE_COUNT = 100;
const MAX_SAVED_SCROLL_ANCHORS = 10;

interface ScrollAnchor {
  rowKey: string;
  hiddenPixels: number;
}

interface MessageRow {
  key: string;
  group: MessageGroupType;
  showDateSeparator: boolean;
}

interface MessageListContext {
  channel?: Channel | null;
  isDM: boolean;
  isGroupDM: boolean;
  canReadHistory: boolean;
  hasMore: boolean;
  isLoading: boolean;
  loadingLabel: string;
}

const savedScrollAnchors = new Map<string, ScrollAnchor>();

const SpaceEndMessage = ({
  channel,
  canReadHistory
}: {
  channel: Channel | null;
  canReadHistory: boolean;
}) => {
  const { t } = useTranslation("chat");

  return (
    <Stack direction="column" spacing={1} margin="16px 16px 0 16px">
      <Paper
        width={64}
        height={64}
        elevation={10}
        padding={3}
        borderRadius="50%"
        alignItems="center"
        justifyContent="center"
        display="flex"
        boxShadow="none"
      >
        <HashIcon size={48} />
      </Paper>

      <Typography level="h1" fontWeight={700} margin="8px 0">
        {t("empty.channel.welcome", { channel: channel?.name })}
      </Typography>

      {canReadHistory ? (
        <Typography textColor="secondary">
          {t("empty.channel.start", { channel: channel?.name })}
        </Typography>
      ) : (
        <Typography textColor="secondary">
          {t("empty.channel.noHistory")}
        </Typography>
      )}
    </Stack>
  );
};

const DMEndMessage = ({
  channel,
  isGroupDM
}: {
  channel: Channel;
  isGroupDM: boolean;
}) => {
  const { t } = useTranslation("chat");
  const conversation =
    channel?.name ||
    channel?.dmRecipients?.map((r) => r.displayName).join(", ");

  return (
    <Stack direction="column" spacing={1} margin="16px 16px 0 16px">
      {isGroupDM ? (
        channel.iconUrl ? (
          <Avatar
            src={channel.iconUrl}
            size={96}
            shape={channel.flags.has("RoundedIcon") ? "circle" : "square"}
          />
        ) : (
          <DMGroupAvatar users={channel?.dmRecipientsList || []} size={96} />
        )
      ) : (
        <UserAvatar user={channel?.dmRecipient} size={64} />
      )}

      <Typography level="h1" fontWeight={700} margin="8px 0">
        {isGroupDM
          ? conversation
          : t("empty.dm.firstMessage", {
              name: channel?.dmRecipient?.displayName
            })}
      </Typography>

      <Typography textColor="secondary">
        {t("empty.dm.beginning", { conversation })}
      </Typography>
    </Stack>
  );
};

const MessageListHeader = ({ context }: { context: MessageListContext }) => {
  if (context.isLoading || context.hasMore)
    return (
      <MessageListSkeleton
        label={context.loadingLabel}
        count={context.isLoading ? 8 : 3}
      />
    );

  if (!context.channel) return null;

  return context.isDM ? (
    <DMEndMessage channel={context.channel} isGroupDM={context.isGroupDM} />
  ) : (
    <SpaceEndMessage
      channel={context.channel}
      canReadHistory={context.canReadHistory}
    />
  );
};

const MessageListFooter = () => <div style={{ height: 30 }} />;

export const MessageList = observer(({ channel: channelProp }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useResizeObserver<HTMLDivElement>({ ref: ref.current });
  const { t } = useTranslation("chat");
  const { openContextMenu } = useMenu();
  const logger = new Logger({ tag: "MessageList" });

  const isAtBottom = useRef(true);
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const rowsRef = useRef<MessageRow[]>([]);

  const firstItemIndexRef = useRef(START_INDEX);
  const oldestMessageIdRef = useRef<string | null>(null);

  const channel = channelProp ?? app.channels.active;

  const isDM =
    channel?.type === ChannelType.DM || channel?.type === ChannelType.GroupDM;
  const isGroupDM = channel?.type === ChannelType.GroupDM;

  const canReadHistory = isDM
    ? true
    : (() => {
        const me = channel?.space?.members.me;
        return me?.hasPermission("ReadMessageHistory", channel) ?? false;
      })();

  const rawGroups = channel?.messages.groups;

  const messageGroups = useMemo(() => {
    if (!rawGroups) return undefined;

    if (isDM || canReadHistory) return rawGroups;

    const lastGroup = rawGroups[rawGroups.length - 1];
    const lastId = lastGroup?.messages[lastGroup.messages.length - 1]?.id;
    if (!lastId) return rawGroups;

    return rawGroups
      .map((group) => ({
        ...group,
        messages: group.messages.filter((message) => message.id !== lastId)
      }))
      .filter((group) => group.messages.length > 0);
  }, [rawGroups, isDM, canReadHistory]);

  const rows = useMemo<MessageRow[]>(() => {
    if (!messageGroups) return [];

    return [...messageGroups].reverse().map((group, index, groups) => {
      const olderGroup = groups[index - 1];
      return {
        key: `messageGroup-${group.messages[group.messages.length - 1].id}`,
        group,
        showDateSeparator:
          !olderGroup ||
          group.createdAt.toDateString() !== olderGroup.createdAt.toDateString()
      };
    });
  }, [messageGroups]);

  const initialLocationRef = useRef<{
    channelId: string | undefined;
    location: {
      index: number | "LAST";
      align: "start" | "end";
      offset?: number;
    };
  } | null>(null);

  if (initialLocationRef.current?.channelId !== channel?.id) {
    const anchor = channel ? savedScrollAnchors.get(channel.id) : undefined;
    const anchorIndex = anchor
      ? rows.findIndex((row) => row.key === anchor.rowKey)
      : -1;

    initialLocationRef.current = {
      channelId: channel?.id,
      location:
        anchor && anchorIndex !== -1
          ? { index: anchorIndex, align: "start", offset: anchor.hiddenPixels }
          : { index: "LAST", align: "end" }
    };
  }

  const firstItemIndex = useMemo(() => {
    const previousOldestId = oldestMessageIdRef.current;
    if (previousOldestId) {
      const prependedCount = rows.findIndex((row) =>
        row.group.messages.some((message) => message.id === previousOldestId)
      );
      if (prependedCount > 0) firstItemIndexRef.current -= prependedCount;
    }

    const oldestGroup = rows[0]?.group;
    oldestMessageIdRef.current =
      oldestGroup?.messages[oldestGroup.messages.length - 1]?.id ?? null;

    return firstItemIndexRef.current;
  }, [rows]);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const revealMessage = useCallback((messageId: string) => {
    const rowIndex = rowsRef.current.findIndex((row) =>
      row.group.messages.some((message) => message.id === messageId)
    );
    if (rowIndex === -1) return;

    virtuosoRef.current?.scrollToIndex({ index: rowIndex, align: "center" });
  }, []);

  const readScrollAnchor = useCallback((): ScrollAnchor | null => {
    const scroller = scrollerRef.current;
    if (!scroller) return null;

    const scrollerTop = scroller.getBoundingClientRect().top;
    const rowElements =
      scroller.querySelectorAll<HTMLElement>("[data-row-key]");

    for (const rowElement of rowElements) {
      const rowRect = rowElement.getBoundingClientRect();
      if (rowRect.bottom > scrollerTop && rowElement.dataset.rowKey) {
        return {
          rowKey: rowElement.dataset.rowKey,
          hiddenPixels: scrollerTop - rowRect.top
        };
      }
    }

    return null;
  }, []);

  const saveScrollAnchor = useCallback(() => {
    if (!channel) return;

    if (isAtBottom.current) {
      savedScrollAnchors.delete(channel.id);
      return;
    }

    const anchor = readScrollAnchor();
    if (!anchor) return;

    savedScrollAnchors.delete(channel.id);
    savedScrollAnchors.set(channel.id, anchor);

    if (savedScrollAnchors.size > MAX_SAVED_SCROLL_ANCHORS) {
      const oldestChannelId = savedScrollAnchors.keys().next().value;
      if (oldestChannelId) {
        savedScrollAnchors.delete(oldestChannelId);
        app.channels
          .get(oldestChannelId)
          ?.messages.prune(RETAINED_MESSAGE_COUNT);
      }
    }
  }, [app, channel, readScrollAnchor]);

  const { fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    initialPageParam: undefined,
    queryKey: ["messages", channel?.id],
    queryFn: async ({ pageParam }: any) => {
      if (!pageParam) {
        const count = await channel?.getMessages(true);
        const lastGroup =
          channel?.messages.groups[channel.messages.groups.length - 1];
        const earliestId =
          lastGroup?.messages?.[lastGroup.messages.length - 1]?.id ?? null;
        return { count, earliestId };
      }

      const count = await channel?.getMessages(false, LIMIT, pageParam);
      const lastGroup =
        channel?.messages.groups[channel.messages.groups.length - 1];
      const earliestId =
        lastGroup?.messages?.[lastGroup.messages.length - 1]?.id ?? null;
      return { count, earliestId, before: pageParam };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.count != null && lastPage.count < LIMIT) return undefined;
      if (!lastPage?.earliestId) return undefined;
      return lastPage.earliestId;
    },
    // Space channels respect history permission; DMs always fetch
    enabled: !!channel?.id && (isDM || canReadHistory),
    gcTime: 0
  });

  const { mutate: sendAck } = useMutation({
    mutationFn: async (messageId: string) => {
      if (!channel?.id) return null;

      return app.rest.post(`/channels/${channel.id}/messages/${messageId}/ack`);
    }
  });

  const ackLatest = useCallback(() => {
    if (!channel?.id) return;
    if (!isAtBottom.current) return;

    const lastMessage = channel.lastMessage;
    if (!lastMessage || "status" in lastMessage) return;

    const readState = app.readStates.get(channel.id);
    if (readState?.isReadUpTo(lastMessage.id)) return;

    app.readStates.updateLocal(channel.id, lastMessage.id);
    sendAck(lastMessage.id);
  }, [
    channel?.id,
    channel?.lastMessage?.id,
    channel?.messages.groups,
    sendAck,
    app.readStates
  ]);

  useEffect(() => {
    if (!channel?.id) return;
    ackLatest();
  }, [channel?.id, channel?.messages.groups, ackLatest]);

  useEffect(() => {
    if (!channel) return;
    return () => {
      if (!savedScrollAnchors.has(channel.id)) {
        channel.messages.prune(RETAINED_MESSAGE_COUNT);
      }
    };
  }, [channel]);

  useEffect(() => {
    const request = app.jumpToMessage;
    if (!request || request.channelId !== channel?.id) return;

    void jumpToChannelMessage(
      channel,
      request.messageId,
      theme,
      revealMessage
    ).then((success) => {
      if (success) app.clearJumpToMessage();
    });
  }, [app, app.jumpToMessage, channel, theme, revealMessage]);

  const handleAtBottomChange = useCallback(
    (atBottom: boolean) => {
      isAtBottom.current = atBottom;
      if (atBottom) ackLatest();
      saveScrollAnchor();
    },
    [ackLatest, saveScrollAnchor]
  );

  const handleScrollingChange = useCallback(
    (scrolling: boolean) => {
      if (!scrolling) saveScrollAnchor();
    },
    [saveScrollAnchor]
  );

  const fetchMore = useCallback(() => {
    if (!channel?.messages.count) {
      logger.warn("channel has no messages, aborting fetchMore!");
      return;
    }

    const lastGroup = messageGroups?.[messageGroups.length - 1];
    if (!lastGroup) {
      logger.warn("No last group found, aborting fetchMore");
      return;
    }
    if ("status" in lastGroup.messages[0]) {
      logger.debug("Last group is queued messages; ignoring fetchMore");
      return;
    }

    if (!hasNextPage) {
      logger.debug("No more pages to fetch");
      return;
    }

    logger.debug("fetching next page for channel", channel.id);
    fetchNextPage().catch((err) => {
      logger.error("Error fetching next page", err);
    });
  }, [messageGroups, hasNextPage, fetchNextPage]);

  const runMessageAction = (
    event: KeyboardEvent<HTMLDivElement>,
    element: HTMLElement
  ) => {
    const messageId = element.dataset.messageId;
    const message = messageId ? channel?.messages.get(messageId) : undefined;
    if (!message || message.editing) return false;

    if (
      event.key === "ContextMenu" ||
      (event.shiftKey && event.key === "F10")
    ) {
      const rect = element.getBoundingClientRect();
      openContextMenu(
        new MouseEvent("contextmenu", {
          clientX: rect.left + 48,
          clientY: rect.top + rect.height / 2
        }),
        { type: "message", message }
      );
      return true;
    }

    if (event.key === "+" || event.code === "NumpadAdd") {
      if (!message.canReact) return false;
      app.requestReactionPicker(message.id);
      return true;
    }

    switch (event.code) {
      case "KeyR":
        app.setReplyingTo(message);
        app.announcer.announce(
          t("announce.replyingTo", {
            name: message.author?.displayName ?? ""
          })
        );
        return true;
      case "KeyE":
        if (!message.isMine) return false;
        message.setEditing(true);
        return true;
      case "KeyB": {
        const wasBookmarked = app.bookmarks.has(message.id);
        void app.bookmarks.toggle(message.id).then(() => {
          const isBookmarked = app.bookmarks.has(message.id);
          if (isBookmarked === wasBookmarked) return;
          app.announcer.announce(
            t(isBookmarked ? "announce.bookmarked" : "announce.bookmarkRemoved")
          );
        });
        return true;
      }
      case "KeyP":
        if (!message.canPin) return false;
        void message
          .togglePinned()
          .then(() =>
            app.announcer.announce(
              t(message.pinned ? "announce.pinned" : "announce.unpinned")
            )
          );
        return true;
      default:
        return false;
    }
  };

  const focusMessage = (element: HTMLElement | undefined) => {
    if (!element) return;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: "nearest" });
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    )
      return;

    const messageElements = Array.from(
      ref.current?.querySelectorAll<HTMLElement>("[data-message-id]") ?? []
    ).sort(
      (first, second) =>
        second.getBoundingClientRect().top - first.getBoundingClientRect().top
    );
    if (messageElements.length === 0) return;

    const focusedMessage = target.closest<HTMLElement>("[data-message-id]");
    const currentIndex = focusedMessage
      ? messageElements.indexOf(focusedMessage)
      : -1;
    const newestIndex = 0;
    const oldestIndex = messageElements.length - 1;

    if (focusedMessage) {
      if (event.shiftKey && event.key === "Delete") {
        const messageId = focusedMessage.dataset.messageId;
        const message = messageId
          ? channel?.messages.get(messageId)
          : undefined;
        if (!message?.canDelete) return;

        event.preventDefault();
        focusMessage(
          messageElements[currentIndex + 1] ?? messageElements[currentIndex - 1]
        );
        void message
          .delete()
          .then(() => app.announcer.announce(t("announce.deleted")));
        return;
      }

      if (runMessageAction(event, focusedMessage)) {
        event.preventDefault();
        return;
      }
    }

    let nextIndex: number;

    switch (event.key) {
      case "ArrowUp":
        nextIndex =
          currentIndex === -1
            ? newestIndex
            : Math.min(currentIndex + 1, oldestIndex);
        break;
      case "ArrowDown":
        nextIndex =
          currentIndex === -1
            ? newestIndex
            : Math.max(currentIndex - 1, newestIndex);
        break;
      case "Home":
        nextIndex = oldestIndex;
        break;
      case "End":
        nextIndex = newestIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusMessage(messageElements[nextIndex]);
  };

  return (
    <MessageAreaWidthContext.Provider
      value={(width ?? 0) - MESSAGE_AREA_PADDING}
    >
      <Stack
        direction="column"
        flex="1 1 auto"
        ref={ref}
        onKeyDown={handleListKeyDown}
        tabIndex={0}
        role="region"
        aria-label={t("messageList.label", { name: channel?.name ?? "" })}
        css={{
          minHeight: 0,
          outline: "none",
          "& [data-message-id]": { outline: "none" },
          "& [data-message-id]:focus-visible": {
            boxShadow: `inset 0 0 0 2px ${theme.colors.primary}`,
            borderRadius: 6
          },
          "&:focus-visible": {
            boxShadow: `inset 0 0 0 2px ${theme.colors.primary}`
          }
        }}
      >
        <Virtuoso
          key={channel?.id}
          ref={virtuosoRef}
          scrollerRef={(element) => {
            scrollerRef.current =
              element instanceof HTMLElement ? element : null;
          }}
          style={{ flex: 1 }}
          data={rows}
          firstItemIndex={firstItemIndex}
          initialTopMostItemIndex={initialLocationRef.current?.location}
          computeItemKey={(_, row) => row.key}
          alignToBottom
          followOutput={(atBottom) => (atBottom ? "auto" : false)}
          atBottomThreshold={50}
          atBottomStateChange={handleAtBottomChange}
          isScrolling={handleScrollingChange}
          startReached={fetchMore}
          context={{
            channel,
            isDM,
            isGroupDM: isGroupDM ?? false,
            canReadHistory,
            hasMore: hasNextPage,
            isLoading,
            loadingLabel: t("loading")
          }}
          components={{ Header: MessageListHeader, Footer: MessageListFooter }}
          itemContent={(_, row) => (
            <div data-row-key={row.key}>
              {row.showDateSeparator && (
                <MessageDateSeparator date={row.group.createdAt} />
              )}
              <div
                css={{
                  paddingBottom: "var(--message-density-group-gap, 0.375rem)"
                }}
              >
                <MessageGroup group={row.group} />
              </div>
            </div>
          )}
        />
      </Stack>
    </MessageAreaWidthContext.Provider>
  );
});
