import { ScheduledPostCard } from "@components/Post/ScheduledPostCard";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

export const Route = createFileRoute("/_authenticated/feed/scheduled")({
  component: observer(RouteComponent)
});

function RouteComponent() {
  const app = useAppStore();

  const { isLoading } = useQuery({
    queryKey: ["posts", "scheduled"],
    queryFn: () => app.posts.getScheduledFeed()
  });

  const scheduledPosts = app.posts.all
    .filter((post) => post.isScheduled)
    .slice()
    .sort(
      (a, b) =>
        (a.scheduledFor?.getTime() ?? 0) - (b.scheduledFor?.getTime() ?? 0)
    );

  return (
    <Stack direction="column" spacing={3} width="100%" height="100%" overflowY="auto">
      <Typography level="h6">Scheduled Posts</Typography>

      {isLoading && <Typography level="body-sm">Loading…</Typography>}

      {!isLoading && scheduledPosts.length === 0 && (
        <Typography level="body-sm" textColor="secondary">
          You have no scheduled posts.
        </Typography>
      )}

      {scheduledPosts.map((post) => (
        <ScheduledPostCard key={post.id} post={post} />
      ))}
    </Stack>
  );
}
