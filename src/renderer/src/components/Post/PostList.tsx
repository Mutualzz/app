import { FileDropZone } from "@components/FileDropZone";
import { FeedCommentsLayout } from "@components/Post/FeedCommentsLayout";
import { FEED_COLUMN_MAX_WIDTH } from "@components/Post/feedLayout";
import { PostCard } from "@components/Post/PostCard";
import { MediaPostCard } from "@components/Post/MediaPostCard";
import {
  PostComposer,
  type PostComposerHandle
} from "@components/Post/PostComposer";
import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import { useInfiniteQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useCallback, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTranslation } from "react-i18next";

interface Props {
  variant: "friends" | "for-you" | "saved";
  showComposer?: boolean;
}

const LIMIT = 25;

export const PostList = observer(({ variant, showComposer }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("chat");
  const composerRef = useRef<PostComposerHandle>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["posts", variant],
      initialPageParam: variant === "for-you" ? 1 : undefined,
      queryFn: async ({ pageParam }: any) => {
        if (variant === "for-you") {
          const posts = await app.posts.getForYouFeed({
            page: pageParam ?? 1,
            limit: LIMIT
          });

          return {
            ids: posts.map((post) => post.id),
            nextPage: (pageParam ?? 1) + 1,
            count: posts.length
          };
        }

        const posts =
          variant === "saved"
            ? await app.posts.getSavedFeed({ before: pageParam, limit: LIMIT })
            : await app.posts.getFriendsFeed({
                before: pageParam,
                limit: LIMIT
              });

        return {
          ids: posts.map((post) => post.id),
          nextCursor: posts[posts.length - 1]?.id,
          count: posts.length
        };
      },
      getNextPageParam: (lastPage: any) => {
        if (!lastPage.count || lastPage.count < LIMIT) return undefined;
        return variant === "for-you" ? lastPage.nextPage : lastPage.nextCursor;
      }
    });

  const ids = data?.pages.flatMap((page: any) => page.ids as string[]) ?? [];

  const posts = ids
    .map((id) => app.posts.get(id))
    .filter((post): post is NonNullable<typeof post> => !!post);

  const fetchMore = useCallback(() => {
    fetchNextPage().catch(() => {});
  }, [fetchNextPage]);

  const listBody = (
    <Stack
      id="post-list-scroll"
      direction="column"
      spacing={2.5}
      width="100%"
      height="100%"
      overflowY="auto"
      flex={1}
      alignItems="center"
      css={{ minHeight: 0 }}
    >
      <Stack
        direction="column"
        spacing={2.5}
        width="100%"
        maxWidth={FEED_COLUMN_MAX_WIDTH}
      >
        {showComposer && (
          <PostComposer ref={composerRef} onPosted={() => refetch()} />
        )}

        <InfiniteScroll
          dataLength={posts.length}
          next={fetchMore}
          hasMore={!!hasNextPage}
          loader={null}
          scrollableTarget="post-list-scroll"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {posts.map((post) =>
            post.attachments.length > 0 ? (
              <MediaPostCard key={post.id} post={post} />
            ) : (
              <PostCard key={post.id} post={post} />
            )
          )}
        </InfiniteScroll>

        {!isFetchingNextPage && posts.length === 0 && (
          <Stack alignItems="center" justifyContent="center" p={6}>
            {variant === "saved"
              ? t("feed.empty.saved")
              : t("feed.empty.posts")}
          </Stack>
        )}
      </Stack>
    </Stack>
  );

  if (showComposer) {
    return (
      <FeedCommentsLayout>
        <FileDropZone
          enabled
          onDropFiles={(files) => composerRef.current?.addFiles(files)}
          width="100%"
          height="100%"
          css={{ minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          {listBody}
        </FileDropZone>
      </FeedCommentsLayout>
    );
  }

  return <FeedCommentsLayout>{listBody}</FeedCommentsLayout>;
});
