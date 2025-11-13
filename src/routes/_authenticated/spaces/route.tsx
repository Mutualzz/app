import { SpacesChannelList } from "@components/Spaces/SpacesChannelList";
import { SpacesSidebar } from "@components/Spaces/SpacesSidebar";
import { UserBar } from "@components/User/UserBar";
import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import {
    createFileRoute,
    Outlet,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { observer } from "mobx-react";
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

    const noSpaceSelected = !params;

    useEffect(() => {
        app.setMode("spaces");

        return () => {
            app.resetMode();
        };
    }, []);

    useEffect(() => {
        if (noSpaceSelected) {
            app.spaces.setActive(app.spaces.mostRecentSpaceId);
            if (app.spaces.activeId) {
                navigate({
                    to: `/spaces/${app.spaces.activeId}`,
                });
            }
        }
    }, [params]);

    return (
        <Stack width="100%" height="100%" direction="row">
            <Stack maxWidth="20rem" width="100%" direction="column">
                <Stack height="100%" direction="row">
                    <SpacesSidebar />
                    <SpacesChannelList skeleton={noSpaceSelected} />
                </Stack>
                <UserBar />
            </Stack>
            <Stack height="100%" width="100%">
                <Outlet />
            </Stack>
        </Stack>
    );
}
