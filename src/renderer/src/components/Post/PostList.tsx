import { FileDropZone } from "@components/FileDropZone";
import { FeedCommentsLayout } from "@components/Post/FeedCommentsLayout";
import { FEED_COLUMN_MAX_WIDTH } from "@components/Post/feedLayout";
import { PostCard } from "@components/Post/PostCard";
import { MediaPostCard } from "@components/Post/MediaPostCard";
import { PostListSkeleton } from "@components/Skeletons";
import {
  PostComposer,
  type PostComposerHandle
} from "@components/Post/PostComposer";
import { useAppStore } from "@hooks/useStores";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { useInfiniteQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { type ReactNode, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";

interface Props {
  variant: "friends" | "for-you" | "saved";
  showComposer?: boolean;
}

const LIMIT = 25;

interface PostListContext {
  composer: ReactNode;
  isEmpty: boolean;
  emptyLabel: string;
  isLoading: boolean;
  isFetchingMore: boolean;
  loadingLabel: string;
}

const PostListHeader = ({ context }: { context: PostListContext }) => {
  const { theme } = useTheme();
  if (!context.composer) return null;

  return (
    <div
      css={{
        width: "100%",
        maxWidth: FEED_COLUMN_MAX_WIDTH,
        margin: "0 auto",
        paddingBottom: theme.spacing(2.5)
      }}
    >
      {context.composer}
    </div>
  );
};

const PostListFooter = ({ context }: { context: PostListContext }) => {
  if (context.isLoading || context.isFetchingMore)
    return (
      <div
        css={{
          width: "100%",
          maxWidth: FEED_COLUMN_MAX_WIDTH,
          margin: "0 auto",
          paddingBottom: 12
        }}
      >
        <PostListSkeleton
          label={context.loadingLabel}
          count={context.isLoading ? 3 : 1}
        />
      </div>
    );

  if (!context.isEmpty) return null;

  return (
    <Stack alignItems="center" justifyContent="center" p={6}>
      {context.emptyLabel}
    </Stack>
  );
};

export const PostList = observer(({ variant, showComposer }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("chat");
  const composerRef = useRef<PostComposerHandle>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
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

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage().catch(() => {
      return;
    });
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePosted = useCallback(() => {
    void refetch();
  }, [refetch]);

  const listBody = (
    <Virtuoso
      id="post-list-scroll"
      style={{ flex: 1, width: "100%", height: "100%", minHeight: 0 }}
      data={posts}
      computeItemKey={(_, post) => post.id}
      endReached={handleEndReached}
      increaseViewportBy={{ top: 600, bottom: 1200 }}
      context={{
        composer: showComposer ? (
          <PostComposer ref={composerRef} onPosted={handlePosted} />
        ) : null,
        isEmpty: !isLoading && !isFetchingNextPage && posts.length === 0,
        emptyLabel:
          variant === "saved" ? t("feed.empty.saved") : t("feed.empty.posts"),
        isLoading,
        isFetchingMore: isFetchingNextPage,
        loadingLabel: t("loading")
      }}
      components={{ Header: PostListHeader, Footer: PostListFooter }}
      itemContent={(_, post) => (
        <div
          css={{
            width: "100%",
            maxWidth: FEED_COLUMN_MAX_WIDTH,
            margin: "0 auto",
            paddingBottom: 12
          }}
        >
          {post.attachments.length > 0 ? (
            <MediaPostCard post={post} />
          ) : (
            <PostCard post={post} />
          )}
        </div>
      )}
    />
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
