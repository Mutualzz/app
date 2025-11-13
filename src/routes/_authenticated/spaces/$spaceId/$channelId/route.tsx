import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createFileRoute(
    "/_authenticated/spaces/$spaceId/$channelId",
)({
    component: observer(RouteComponent),
});

function RouteComponent() {
    return <div>Hello "/_authenticated/spaces/$spaceId/$channelId"!</div>;
}
