import {
    useUserSettingsSidebar,
    type UserSettingsSidebarPage,
} from "@contexts/UserSettingsSidebar.context";
import { Divider, Stack, Typography } from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { AppAppearanceSettings } from "./pages/app/AppAppearanceSettings";
import { UserAccountSettings } from "./pages/user/UserAccountSettings";
import { UserProfileSettings } from "./pages/user/UserProfileSettings";

interface UserSettingsContentProps {
    redirectTo?: UserSettingsSidebarPage;
}

export const UserSettingsContent = observer(
    ({ redirectTo }: UserSettingsContentProps) => {
        const { currentPage, setCurrentPage } = useUserSettingsSidebar();

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
                {currentPage === "profile" && <UserProfileSettings />}
                {currentPage === "my-account" && <UserAccountSettings />}
                {currentPage === "appearance" && <AppAppearanceSettings />}
            </Stack>
        );
    },
);
