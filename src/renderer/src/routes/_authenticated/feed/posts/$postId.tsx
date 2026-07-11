import { PostCard } from "@components/Post/PostCard";
import { MediaPostCard } from "@components/Post/MediaPostCard";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/feed/posts/$postId")({
  component: observer(RouteComponent)
});

function RouteComponent() {
  const app = useAppStore();
  const { postId } = Route.useParams();
  const { t } = useTranslation("chat");

  const { isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => app.posts.resolve(postId, true),
    enabled: !!postId
  });

  const post = app.posts.get(postId);

  return (
    <Stack direction="column" spacing={3} width="100%" height="100%" overflowY="auto">
      {isLoading && <Typography level="body-sm">{t("loading")}</Typography>}

      {isError && !post && (
        <Typography level="body-sm" textColor="secondary">
          {t("feed.empty.postUnavailable")}
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
