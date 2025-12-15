import { FeedSidebar } from "@components/Feed/FeedSidebar";
import { Paper } from "@components/Paper";
import { UserBar } from "@components/User/UserBar";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/feed")({
    component: observer(RouteComponent),
});

function RouteComponent() {
    const app = useAppStore();

    useEffect(() => {
        app.setMode("feed");

        return () => {
            app.resetMode();
        };
    }, []);

    return (
        <Stack width="100%" height="100%" direction="row">
            <Stack
                position="relative"
                maxWidth="15rem"
                width="100%"
                direction="column"
            >
                <FeedSidebar />
                <UserBar />
            </Stack>
            <Paper
                borderRight="0 !important"
                borderBottom="0 !important"
                borderTopLeftRadius="0.75rem"
                width="100%"
                p={5}
                height="100%"
            >
                <Typography>
                    This is your feed. Here you will see posts from your
                    algorithmically generated interests.
                </Typography>
                <Outlet />
            </Paper>
        </Stack>
    );
}
