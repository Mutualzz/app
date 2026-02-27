import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import {
    type UserSettingsPage,
    useUserSettings,
} from "@components/UserSettings/UserSettings.context.tsx";
import { useAppStore } from "@hooks/useStores";
import { IconButton, Stack, Typography } from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { FaX } from "react-icons/fa6";
import { AppAppearanceSettings } from "./pages/app/AppAppearanceSettings";
import { UserAccountSettings } from "./pages/user/UserAccountSettings";
import { UserProfileSettings } from "./pages/user/UserProfileSettings";
import { AppVoiceVideoSettings } from "@components/UserSettings/pages/app/AppVoiceVideoSettings.tsx";

interface UserSettingsContentProps {
    redirectTo?: UserSettingsPage;
}

export const UserSettingsContent = observer(
    ({ redirectTo }: UserSettingsContentProps) => {
        const app = useAppStore();
        const { currentPage, setCurrentPage } = useUserSettings();
        const { closeModal } = useModal();

        const didInitRedirect = useRef(false);

        useEffect(() => {
            if (didInitRedirect.current) return;
            if (!redirectTo) return;

            didInitRedirect.current = true;

            setCurrentPage(redirectTo);
        }, [redirectTo, setCurrentPage]);

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
                    elevation={app.settings?.preferEmbossed ? 3 : 1}
                    justifyContent="space-between"
                    borderTop="0 !important"
                    borderLeft="0 !important"
                >
                    <Typography
                        level={{ xs: "h6", sm: "h5" }}
                        fontFamily="monospace"
                    >
                        {currentPage === "voice_and_video"
                            ? "Voice & Video"
                            : startCase(currentPage)}
                    </Typography>
                    <IconButton
                        color="neutral"
                        css={{
                            marginRight: "0.5rem",
                        }}
                        variant="plain"
                        size="sm"
                        onClick={() => closeModal()}
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
                    elevation={app.settings?.preferEmbossed ? 2 : 1}
                    direction="column"
                    px={{ xs: "0.5rem", sm: 3 }}
                    borderTop="0 !important"
                    borderLeft="0 !important"
                    borderBottom="0 !important"
                    py={{ xs: "0.5rem", sm: 1 }}
                >
                    {currentPage === "profile" && <UserProfileSettings />}
                    {currentPage === "my-account" && <UserAccountSettings />}
                    {currentPage === "appearance" && <AppAppearanceSettings />}
                    {currentPage === "voice_and_video" && (
                        <AppVoiceVideoSettings />
                    )}
                </Paper>
            </Stack>
        );
    },
);
