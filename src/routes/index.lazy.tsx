import { createLazyFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
    component: Index,
});

function Index() {
    return (
        <div>
            <h1>Website is currently under development</h1>
            <h2>The UI is being made</h2>
            <div>
                <h2>Meanwhile you can wait? idk :D :3</h2>
            </div>
            <Outlet />
        </div>
    );
}
