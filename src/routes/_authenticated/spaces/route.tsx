import { SpacesChannelList } from "@components/Spaces/SpacesChannelList";
import { SpacesSidebar } from "@components/Spaces/SpacesSidebar";
import { UserBar } from "@components/User/UserBar";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/spaces")({
    component: observer(RouteComponent),
});

function RouteComponent() {
    const app = useAppStore();

    useEffect(() => {
        app.setMode("spaces");

        return () => {
            app.resetMode();
        };
    }, []);

    return (
        <Stack width="100%" height="100%" direction="row">
            <Stack maxWidth="20rem" width="100%" direction="column">
                <Stack height="100%" direction="row">
                    <SpacesSidebar />
                    <SpacesChannelList />
                </Stack>
                <UserBar />
            </Stack>
            <Stack p={20} height="100%" width="100%">
                <Typography>
                    This is your spaces. Here you will see the channel list and
                    and where you can type/message in the channel
                </Typography>
                <Outlet />
            </Stack>
        </Stack>
    );
}
