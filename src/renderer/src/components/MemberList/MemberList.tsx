import { ListSection } from "@components/ListSection";
import { MemberListItem } from "@components/MemberList/MemberListItem";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useCallback, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const PAGE_SIZE = 50;

export const MemberList = observer(() => {
  const app = useAppStore();
  const space = app.spaces.active;
  const channel = app.channels.active;

  const store =
    space && channel ? space.memberLists.get(channel.listId) : undefined;
  const list = store?.list ?? null;

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadedCount = list
    ? list.reduce((acc, g) => acc + (g.items?.length ?? 0), 0)
    : 0;
  const memberCount =
    typeof store?.memberCount === "number" ? store.memberCount : 0;

  const hasMore = !store ? true : loadedCount < memberCount;

  const handleLoadMore = useCallback(() => {
    if (!space || !channel) return;
    app.gateway.requestMemberListRange(space.id, channel.id, PAGE_SIZE);
  }, [space, channel, app.gateway]);

  const totalItems = list
    ? list.reduce((acc, g) => acc + (g.items?.length ?? 0), 0)
    : 0;

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 0}
      direction="column"
      flex="0 0 240px"
      overflowX="hidden"
      borderTop="0 !important"
      borderRight="0 !important"
      borderBottom="0 !important"
    >
      <div
        ref={scrollRef}
        id="member-list-scroll"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <InfiniteScroll
          dataLength={totalItems}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={
            <Stack alignItems="center" justifyContent="center" p={2}>
              <Typography textColor="secondary">Loading members…</Typography>
            </Stack>
          }
          scrollableTarget="member-list-scroll"
          style={{
            overflowY: "auto",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {list
            ? list.map((category, i) => (
                <ListSection
                  key={`${category.name}-${i}`}
                  name={category.name}
                  items={category.items.map((m: any) => (
                    <MemberListItem
                      key={m.userId ?? m.user?.id ?? `${category.name}-${i}`}
                      member={m}
                      isOwner={(m.userId ?? m.user?.id) === space?.ownerId}
                    />
                  ))}
                />
              ))
            : null}
        </InfiniteScroll>
      </div>
    </Paper>
  );
});
