import { Paper } from "@components/Paper";
import { Logger } from "@mutualzz/logger";
import { Stack, Typography } from "@mutualzz/ui-web";
import type { MessageGroup as MessageGroupType } from "@stores/Message.store";
import type { Channel } from "@stores/objects/Channel";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { createContext, UIEvent, useCallback, useEffect, useRef } from "react";
import { FaHashtag } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import useResizeObserver from "use-resize-observer";
import { MessageGroup } from "@components/Message/MessageGroup";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";

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
}) => (
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
            <FaHashtag size={48} />
        </Paper>

        <Typography level="h1" fontWeight={700} margin="8px 0">
            Welcome to #{channel?.name}!
        </Typography>

        {canReadHistory ? (
            <Typography textColor="secondary">
                This is the start of the #{channel?.name} channel.
            </Typography>
        ) : (
            <Typography textColor="secondary">
                You don't have permissions to read message history
            </Typography>
        )}
    </Stack>
);

const DMEndMessage = ({
    channel,
    isGroupDM
}: {
    channel: Channel;
    isGroupDM: boolean;
}) => (
    <Stack direction="column" spacing={1} margin="16px 16px 0 16px">
        {isGroupDM ? (
            <DMGroupAvatar users={channel?.dmRecipients || []} size={96} />
        ) : (
            <UserAvatar user={channel?.dmRecipient} size={64} />
        )}

        <Typography level="h1" fontWeight={700} margin="8px 0">
            {isGroupDM
                ? channel?.name ||
                  channel?.dmRecipients?.map((r) => r.displayName).join(", ")
                : `Send your first message to ${channel?.dmRecipient?.displayName}`}
        </Typography>

        <Typography textColor="secondary">
            Welcome to the beginning of the{" "}
            {channel?.name ||
                channel?.dmRecipients?.map((r) => r.displayName).join(", ")}
        </Typography>
    </Stack>
);

export const MessageList = observer(({ channel: channelProp }: Props) => {
    const app = useAppStore();
    const ref = useRef<HTMLDivElement>(null);
    const { width } = useResizeObserver<HTMLDivElement>({ ref: ref.current });
    const logger = new Logger({ tag: "MessageList" });

    const channel = channelProp ?? app.channels.active;

    const isDM =
        channel?.type === ChannelType.DM ||
        channel?.type === ChannelType.GroupDM;
    const isGroupDM = channel?.type === ChannelType.GroupDM;

    const isAtBottom = useRef(true);

    const canReadHistory = isDM
        ? true
        : (() => {
              const me = channel?.space?.members.me;
              return me?.hasPermission("ReadMessageHistory", channel!) ?? false;
          })();

    const rawGroups = channel?.messages.groups;

    const messageGroups = (() => {
        if (!rawGroups) return undefined;

        if (!isDM && canReadHistory) return rawGroups;

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

    const { fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
        {
            initialPageParam: undefined,
            queryKey: ["messages", channel?.id],
            queryFn: async ({ pageParam }: any) => {
                if (!pageParam) {
                    const count = await channel?.getMessages(true);
                    const lastGroup =
                        channel?.messages.groups[
                            channel.messages.groups.length - 1
                        ];
                    const earliestId =
                        lastGroup?.messages?.[lastGroup.messages.length - 1]
                            ?.id ?? null;
                    return { count, earliestId };
                }

                const count = await channel?.getMessages(
                    false,
                    LIMIT,
                    pageParam
                );
                const lastGroup =
                    channel?.messages.groups[
                        channel.messages.groups.length - 1
                    ];
                const earliestId =
                    lastGroup?.messages?.[lastGroup.messages.length - 1]?.id ??
                    null;
                return { count, earliestId, before: pageParam };
            },
            getNextPageParam: (lastPage) => {
                if (lastPage?.count != null && lastPage.count < LIMIT)
                    return undefined;
                if (!lastPage?.earliestId) return undefined;
                return lastPage.earliestId;
            },
            // Space channels respect history permission; DMs always fetch
            enabled: !!channel?.id && (isDM || canReadHistory)
        }
    );

    const { mutate: sendAck } = useMutation({
        mutationFn: async (messageId: string) => {
            if (!channel?.id) return null;

            return app.rest.post(
                `/channels/${channel.id}/messages/${messageId}/ack`
            );
        }
    });

    const ackLatest = useCallback(() => {
        if (!channel?.id) return;

        const lastMessage = channel.lastMessage;
        if (!lastMessage || "status" in lastMessage) return;

        const readState = app.readStates.get(channel.id);
        if (readState?.lastMessageId === lastMessage.id) return;

        app.readStates.updateLocal(channel.id, lastMessage.id);
        sendAck(lastMessage.id);
    }, [channel?.id, channel?.messages.groups, sendAck]);

    useEffect(() => {
        if (!channel?.id) return;
        ackLatest();
    }, [channel?.id]);

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

    const renderGroup = useCallback(
        (group: MessageGroupType) => (
            <MessageGroup
                key={`messageGroup-${group.messages[group.messages.length - 1].id}`}
                group={group}
            />
        ),
        []
    );

    const loader = isFetchingNextPage ? <></> : null;

    const totalMessages =
        messageGroups?.reduce((acc, g) => acc + (g.messages?.length ?? 0), 0) ??
        0;

    return (
        <MessageAreaWidthContext.Provider
            value={(width ?? 0) - MESSAGE_AREA_PADDING}
        >
            <Stack
                overflowY="auto"
                direction="column-reverse"
                flex="1 1 auto"
                ref={ref}
                id="scrollable-div"
                onScroll={onScroll}
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
                            <DMEndMessage
                                channel={channel}
                                isGroupDM={isGroupDM ?? false}
                            />
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
