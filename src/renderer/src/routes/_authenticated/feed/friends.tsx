import { PostList } from "@components/Post/PostList";
import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

export const Route = createFileRoute("/_authenticated/feed/friends")({
  component: observer(RouteComponent)
});

function RouteComponent() {
  return <PostList variant="friends" showComposer />;
}
