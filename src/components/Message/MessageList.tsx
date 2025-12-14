import { Paper } from "@components/Paper";
import { Logger } from "@mutualzz/logger";
import { Stack, Typography } from "@mutualzz/ui-web";
import type { MessageGroup as MessageGroupType } from "@stores/Message.store";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { useInfiniteQuery } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { createContext, useCallback, useRef } from "react";
import { FaHashtag } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import useResizeObserver from "use-resize-observer";
import { MessageGroup } from "./MessageGroup";

interface Props {
    space?: Space | null;
    channel?: Channel | null;
}

export const MessageAreaWidthContext = createContext(0);
export const MESSAGE_AREA_PADDING = 82;

const LIMIT = 50;

export const MessageList = observer(({ channel }: Props) => {
    const ref = useRef<HTMLDivElement>(null);
    const { width } = useResizeObserver<HTMLDivElement>({ ref: ref.current });
    const logger = new Logger({
        tag: "MessageList",
    });

    const messageGroups = channel?.messages.groups;

    const { fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
        {
            initialPageParam: undefined,
            queryKey: ["messages", channel?.id],
            queryFn: async ({ pageParam }: any) => {
                if (!pageParam) {
                    // first page: fetch latest messages
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
                    pageParam,
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
            enabled: !!channel?.id,
        },
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
    }, [
        messageGroups,
        hasNextPage,
        fetchNextPage,
        channel?.messages.count,
        channel?.id,
    ]);

    const renderGroup = useCallback(
        (group: MessageGroupType) => (
            <MessageGroup
                key={`messageGroup-${group.messages[group.messages.length - 1].id}`}
                group={group}
            />
        ),
        [],
    );

    const loader = isFetchingNextPage ? <></> : null;

    const totalMessages =
        channel?.messages.groups.reduce(
            (acc, g) => acc + (g.messages?.length ?? 0),
            0,
        ) ?? 0;

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
            >
                <InfiniteScroll
                    dataLength={totalMessages}
                    next={fetchMore}
                    style={{
                        display: "flex",
                        flexDirection: "column-reverse",
                        marginBottom: 30,
                        overflow: "hidden",
                    }}
                    hasMore={hasNextPage}
                    inverse={true}
                    loader={loader}
                    scrollThreshold={0.5}
                    scrollableTarget="scrollable-div"
                    endMessage={
                        <Stack
                            direction="column"
                            spacing={1}
                            margin="16px 16px 0 16px"
                        >
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
                            <Typography
                                level="h1"
                                fontWeight={700}
                                margin="8px 0"
                            >
                                Welcome to #{channel?.name}!
                            </Typography>
                            <Typography textColor="secondary">
                                This is the start of the #{channel?.name}{" "}
                                channel.
                            </Typography>
                        </Stack>
                    }
                >
                    {messageGroups?.map(renderGroup)}
                </InfiniteScroll>
            </Stack>
        </MessageAreaWidthContext.Provider>
    );
});
