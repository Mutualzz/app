import { ChannelList } from "@components/Channel/ChannelList.tsx";
import { SpacesSidebar } from "@components/Space/SpacesSidebar";
import { UserBar } from "@components/User/UserBar";
import { useAppStore } from "@hooks/useStores";
import { Stack, useTheme } from "@mutualzz/ui-web";
import {
    createFileRoute,
    Outlet,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { runInAction } from "mobx";
import { dynamicElevation } from "@mutualzz/ui-core";
import { motion } from "motion/react";

export const Route = createFileRoute("/_authenticated/spaces")({
    component: observer(RouteComponent),
});

const ResizeBar = motion.create("div");

function RouteComponent() {
    const app = useAppStore();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const params = useParams({
        from: "/_authenticated/spaces/$spaceId",
        shouldThrow: false,
    });

    useEffect(() => {
        if (app.mode !== "spaces") app.setMode("spaces");

        return () => {
            if (app.mode === "spaces") app.resetMode();
        };
    }, []);

    useEffect(() => {
        runInAction(() => {
            if (params?.spaceId) return;

            const space = app.spaces.setPreferredActive();
            if (!space) return;

            navigate({
                to: "/spaces/$spaceId",
                params: { spaceId: space.id },
                replace: true,
            });
        });
    }, [params?.spaceId]);

    return (
        <Stack width="100%" height="100%" direction="row">
            <Stack
                position="relative"
                width={`${app.channelListWidth}px`}
                minWidth="240px"
                maxWidth="480px"
                direction="column"
                flexShrink={0}
            >
                <Stack height="100%" direction="row">
                    <SpacesSidebar />
                    <ChannelList />

                    <ResizeBar
                        onPointerDown={(e) => {
                            const startX = e.clientX;
                            const startWidth = app.channelListWidth;

                            (
                                e.currentTarget as HTMLDivElement
                            ).setPointerCapture(e.pointerId);

                            const onMove = (moveEvent: PointerEvent) => {
                                app.setChannelListWidth(
                                    startWidth + (moveEvent.clientX - startX),
                                );
                            };

                            const onUp = () => {
                                window.removeEventListener(
                                    "pointermove",
                                    onMove,
                                );
                                window.removeEventListener("pointerup", onUp);
                            };

                            window.addEventListener("pointermove", onMove);
                            window.addEventListener("pointerup", onUp);
                        }}
                        style={{
                            width: 2,
                            cursor: "col-resize",
                            flexShrink: 0,
                            touchAction: "none",
                            userSelect: "none",
                            backgroundColor: app.settings?.preferEmbossed
                                ? dynamicElevation(theme.colors.surface, 4)
                                : "transparent",
                        }}
                        whileHover={{
                            backgroundColor: app.settings?.preferEmbossed
                                ? dynamicElevation(theme.colors.surface, 6)
                                : dynamicElevation(theme.colors.surface, 2),
                        }}
                    />
                </Stack>

                <UserBar />
            </Stack>

            <Stack height="100%" width="100%">
                <Outlet />
            </Stack>
        </Stack>
    );
}
