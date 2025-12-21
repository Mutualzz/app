import { ChannelList } from "@components/Channel/ChannelList/ChannelList";
import { SpacesSidebar } from "@components/Space/SpacesSidebar";
import { UserBar } from "@components/User/UserBar";
import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import {
    createFileRoute,
    Outlet,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/spaces")({
    component: observer(RouteComponent),
});

function RouteComponent() {
    const app = useAppStore();
    const navigate = useNavigate();
    const params = useParams({
        from: "/_authenticated/spaces/$spaceId",
        shouldThrow: false,
    });

    useEffect(() => {
        app.setMode("spaces");

        return () => app.resetMode();
    }, []);

    useEffect(() => {
        if (params && params?.spaceId) return;

        const space = app.spaces.setPreferredActive();
        if (!space) return;
        navigate({
            to: "/spaces/$spaceId",
            params: { spaceId: space.id },
        });
    }, [params]);

    return (
        <Stack width="100%" height="100%" direction="row">
            <Stack
                position="relative"
                maxWidth="20rem"
                width="100%"
                direction="column"
            >
                <Stack height="100%" direction="row">
                    <SpacesSidebar />
                    <ChannelList />
                </Stack>
                <UserBar />
            </Stack>
            <Stack height="100%" width="100%">
                <Outlet />
            </Stack>
        </Stack>
    );
}
