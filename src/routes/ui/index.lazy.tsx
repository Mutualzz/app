import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/ui/")({
    component: PlaygroundIndexComponent,
});

function PlaygroundIndexComponent() {
    return <h2>Use buttons on the sidebar to navigate :3</h2>;
}
