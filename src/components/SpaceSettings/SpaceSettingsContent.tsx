import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import {
    useSpaceSettingsSidebar,
    type SpaceSettingsSidebarPage,
} from "@contexts/SpaceSettingsSidebar.context";
import { useAppStore } from "@hooks/useStores";
import { IconButton, Stack, Typography } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { FaX } from "react-icons/fa6";
import { SpaceInvitesSettings } from "./pages/general/SpaceInvitesSettings";

interface SpaceSettingsContentProps {
    space: Space;
    redirectTo?: SpaceSettingsSidebarPage;
}

export const SpaceSettingsContent = observer(
    ({ space, redirectTo }: SpaceSettingsContentProps) => {
        const app = useAppStore();
        const { closeAllModals } = useModal();
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
                overflow="auto"
                width="100%"
                direction="column"
            >
                <Paper
                    borderTopRightRadius={{
                        xs: "0.75rem",
                        sm: "1.25rem",
                        md: "1.5rem",
                    }}
                    px={{ xs: "0.5rem", sm: 3 }}
                    py={{ xs: "0.5rem", sm: 4 }}
                    borderLeftWidth="0px !important"
                    elevation={app.preferEmbossed ? 3 : 1}
                    justifyContent="space-between"
                    borderTop="0 !important"
                    borderLeft="0 !important"
                >
                    <Typography
                        level={{ xs: "h6", sm: "h5" }}
                        fontFamily="monospace"
                    >
                        {startCase(currentPage)}
                    </Typography>
                    <IconButton
                        color="neutral"
                        css={{
                            marginRight: "0.5rem",
                        }}
                        variant="plain"
                        size="sm"
                        onClick={() => closeAllModals()}
                    >
                        <FaX />
                    </IconButton>
                </Paper>
                <Paper
                    flex={1}
                    height="100%"
                    overflow="auto"
                    width="100%"
                    spacing={1.25}
                    elevation={app.preferEmbossed ? 2 : 1}
                    direction="column"
                    px={{ xs: "0.5rem", sm: 3 }}
                    borderTop="0 !important"
                    borderLeft="0 !important"
                    borderBottom="0 !important"
                    py={{ xs: "0.5rem", sm: 1 }}
                >
                    {currentPage === "invites" && (
                        <SpaceInvitesSettings space={space} />
                    )}
                </Paper>
            </Stack>
        );
    },
);
