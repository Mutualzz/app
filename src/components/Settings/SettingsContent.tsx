import {
    useSettingsSidebar,
    type SettingsSidebarPage,
} from "@contexts/SettingsSidebar.context";
import { Stack, Typography } from "@mutualzz/ui-web";
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
            <Stack width="100%" height="100%" direction="column">
                <Typography
                    level={{ xs: "h5", sm: "display-xs" }}
                    fontSize={{ xs: "1.25rem", sm: "1.5rem" }}
                    fontWeight={700}
                    mb={{ xs: "0.5rem", sm: "1rem" }}
                >
                    {startCase(currentPage)}
                </Typography>
                {currentPage === "profile" && <UserProfileSettings />}
                {currentPage === "my-account" && <UserAccountSettings />}
                {currentPage === "appearance" && <AppAppearanceSettings />}
            </Stack>
        );
    },
);
