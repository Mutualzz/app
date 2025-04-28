import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/ui/paper")({
    component: PlaygroundPaper,
});

function PlaygroundPaper() {
    return <div>Hello "/ui/paper"!</div>;
}
