import { PostCard } from "@components/Post/PostCard";
import { MediaPostCard } from "@components/Post/MediaPostCard";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

export const Route = createFileRoute("/_authenticated/feed/posts/$postId")({
  component: observer(RouteComponent)
});

function RouteComponent() {
  const app = useAppStore();
  const { postId } = Route.useParams();

  const { isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => app.posts.resolve(postId, true),
    enabled: !!postId
  });

  const post = app.posts.get(postId);

  return (
    <Stack direction="column" spacing={3} width="100%" height="100%" overflowY="auto">
      {isLoading && <Typography level="body-sm">Loading…</Typography>}

      {isError && !post && (
        <Typography level="body-sm" textColor="secondary">
          This post doesn't exist, or is no longer available.
        </Typography>
      )}

      {post &&
        (post.attachments.length > 0 ? (
          <MediaPostCard post={post} defaultCommentsOpen />
        ) : (
          <PostCard post={post} />
        ))}
    </Stack>
  );
}
