import {
    useSettingsSidebar,
    type SettingsSidebarPage,
} from "@contexts/SettingsSidebar.context";
import { Divider, Stack, Typography } from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { AppAppearanceSettings } from "./pages/app/AppAppearanceSettings";
import { UserAccountSettings } from "./pages/user/UserAccountSettings";
import { UserProfileSettings } from "./pages/user/UserProfileSettings";

interface SettingsContentProps {
    redirectTo?: SettingsSidebarPage;
}

export const SettingsContent = observer(
    ({ redirectTo }: SettingsContentProps) => {
        const { currentPage, setCurrentPage } = useSettingsSidebar();

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
                pl={{ xs: "1rem", sm: "2rem" }}
                overflow="auto"
                width="100%"
                spacing={5}
                direction="column"
            >
                <Typography
                    level={{ xs: "h6", sm: "h4" }}
                    fontFamily="monospace"
                >
                    {startCase(currentPage)}
                </Typography>
                <Divider lineColor="primary" />
                {currentPage === "profile" && <UserProfileSettings />}
                {currentPage === "my-account" && <UserAccountSettings />}
                {currentPage === "appearance" && <AppAppearanceSettings />}
            </Stack>
        );
    },
);
