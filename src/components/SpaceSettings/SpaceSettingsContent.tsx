import {
    useSpaceSettingsSidebar,
    type SpaceSettingsSidebarPage,
} from "@contexts/SpaceSettingsSidebar.context";
import { Divider, Stack, Typography } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { SpaceInvitesSettings } from "./pages/general/SpaceInvitesSettings";

interface SpaceSettingsContentProps {
    space: Space;
    redirectTo?: SpaceSettingsSidebarPage;
}

export const SpaceSettingsContent = observer(
    ({ space, redirectTo }: SpaceSettingsContentProps) => {
        const { currentPage, setCurrentPage } = useSpaceSettingsSidebar();

        useEffect(() => {
            if (redirectTo) {
                setCurrentPage(redirectTo);
            }
        }, [redirectTo]);

        return (
            <Stack
                flex={1}
                height="100%"
                pt={{ xs: "1rem", sm: "2rem" }}
                px={{ xs: "1rem", sm: "2rem" }}
                overflow="auto"
                width="100%"
                spacing={1.25}
                direction="column"
            >
                <Typography
                    level={{ xs: "h6", sm: "h4" }}
                    fontFamily="monospace"
                    mb={2.5}
                >
                    {startCase(currentPage)}
                </Typography>
                <Divider lineColor="muted" />
                {currentPage === "invites" && (
                    <SpaceInvitesSettings space={space} />
                )}
            </Stack>
        );
    },
);
