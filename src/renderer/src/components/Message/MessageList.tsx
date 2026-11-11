import { Paper } from "@components/Paper";
import { Logger } from "@mutualzz/logger";
import { Avatar, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { MessageGroup as MessageGroupType } from "@stores/Message.store";
import type { Channel } from "@stores/objects/Channel";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import {
  createContext,
  Fragment,
  type UIEvent,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent
} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
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

interface Props {
  channel?: Channel | null;
}

export const MessageAreaWidthContext = createContext(0);
export const MESSAGE_AREA_PADDING = 82;

const LIMIT = 50;

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

export const MessageList = observer(({ channel: channelProp }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useResizeObserver<HTMLDivElement>({ ref: ref.current });
  const { t } = useTranslation("chat");
  const { openContextMenu } = useMenu();
  const logger = new Logger({ tag: "MessageList" });

  const channel = channelProp ?? app.channels.active;

  const isDM =
    channel?.type === ChannelType.DM || channel?.type === ChannelType.GroupDM;
  const isGroupDM = channel?.type === ChannelType.GroupDM;

  const isAtBottom = useRef(true);

  const canReadHistory = isDM
    ? true
    : (() => {
        const me = channel?.space?.members.me;
        return me?.hasPermission("ReadMessageHistory", channel) ?? false;
      })();

  const rawGroups = channel?.messages.groups;

  const messageGroups = (() => {
    if (!rawGroups) return undefined;

    if (isDM || canReadHistory) return rawGroups;

    const getLastMessageId = () => {
      if (!rawGroups || rawGroups.length === 0) return undefined;
      const lastGroup = rawGroups[rawGroups.length - 1];
      if (!lastGroup.messages || lastGroup.messages.length === 0)
        return undefined;
      return lastGroup.messages[lastGroup.messages.length - 1]?.id;
    };

    const lastId = getLastMessageId();
    if (!lastId) return rawGroups;

    return rawGroups
      .map((g) => ({
        ...g,
        messages: g.messages.filter((m) => m.id !== lastId)
      }))
      .filter((g) => (g.messages?.length ?? 0) > 0);
  })();

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
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
    enabled: !!channel?.id && (isDM || canReadHistory)
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
    const request = app.jumpToMessage;
    if (!request || request.channelId !== channel?.id) return;

    void jumpToChannelMessage(channel, request.messageId, theme).then(
      (success) => {
        if (success) app.clearJumpToMessage();
      }
    );
  }, [app, app.jumpToMessage, channel, theme]);

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    isAtBottom.current = el.scrollTop >= -50;
  }, []);

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

  const renderGroup = useCallback(
    (group: MessageGroupType, index: number) => {
      const olderGroup = messageGroups?.[index + 1];
      const showDateSeparator =
        !olderGroup ||
        group.createdAt.toDateString() !== olderGroup.createdAt.toDateString();

      return (
        <Fragment
          key={`messageGroup-${group.messages[group.messages.length - 1].id}`}
        >
          <div
            css={{
              marginBottom: "var(--message-density-group-gap, 0.375rem)"
            }}
          >
            <MessageGroup group={group} />
          </div>
          {showDateSeparator && <MessageDateSeparator date={group.createdAt} />}
        </Fragment>
      );
    },
    [messageGroups]
  );

  const loader = isFetchingNextPage ? <></> : null;

  const totalMessages =
    messageGroups?.reduce((acc, g) => acc + (g.messages?.length ?? 0), 0) ?? 0;

  return (
    <MessageAreaWidthContext.Provider
      value={(width ?? 0) - MESSAGE_AREA_PADDING}
    >
      <Stack
        overflowY="auto"
        overflowX="hidden"
        direction="column-reverse"
        flex="1 1 auto"
        ref={ref}
        id="scrollable-div"
        onScroll={onScroll}
        onKeyDown={handleListKeyDown}
        tabIndex={0}
        role="region"
        aria-label={t("messageList.label", { name: channel?.name ?? "" })}
        css={{
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
        <InfiniteScroll
          dataLength={totalMessages}
          next={fetchMore}
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            marginBottom: 30,
            overflow: "hidden"
          }}
          hasMore={hasNextPage}
          inverse={true}
          loader={loader}
          scrollThreshold={0.5}
          scrollableTarget="scrollable-div"
          endMessage={
            isDM ? (
              <DMEndMessage channel={channel} isGroupDM={isGroupDM ?? false} />
            ) : (
              <SpaceEndMessage
                channel={channel}
                canReadHistory={canReadHistory}
              />
            )
          }
        >
          {messageGroups?.map(renderGroup)}
        </InfiniteScroll>
      </Stack>
    </MessageAreaWidthContext.Provider>
  );
});
