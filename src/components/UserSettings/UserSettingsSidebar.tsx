import { Paper } from "@components/Paper";
import {
    type UserSettingsCategories,
    type UserSettingsPage,
    useUserSettings,
} from "@contexts/UserSettings.context";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    ButtonGroup,
    Divider,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { Fragment, type JSX } from "react";
import {
    FaPaintBrush,
    FaPalette,
    FaSignOutAlt,
    FaUserCog,
} from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { UserAvatar } from "../User/UserAvatar";

interface UserSettingsSidebarProps {
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
    label: UserSettingsPage;
    icon: JSX.Element;
}

type SettingsPages = Record<UserSettingsCategories, Pages[]>;

const settingsPages: SettingsPages = {
    "user-settings": [
        {
            label: "my-account",
            icon: <FaUserCog />,
        },
        {
            label: "profile",
            icon: <FaPaintBrush />,
        },
    ],
    "app-settings": [
        {
            label: "appearance",
            icon: <FaPalette />,
        },
    ],
};

export const UserSettingsSidebar = observer(
    ({ drawerOpen, setDrawerOpen }: UserSettingsSidebarProps) => {
        const app = useAppStore();

        const { currentPage, setCurrentPage, setCurrentCategory } =
            useUserSettings();

        const handlePageSwitch = (
            category: UserSettingsCategories,
            page: UserSettingsPage,
        ) => {
            setCurrentPage(page);
            setCurrentCategory(category);
            if (drawerOpen && setDrawerOpen) {
                setDrawerOpen(false);
            }
        };

        if (!app.account) return null;

        const categories = Object.entries(settingsPages);

        return (
            <Paper
                direction="column"
                width={200}
                height="100%"
                elevation={app.settings?.preferEmbossed ? 5 : 0}
                borderTop="0 !important"
                borderLeft="0 !important"
                borderBottom="0 !important"
                justifyContent="space-between"
                px={2.5}
            >
                <Stack direction="column" height="100%" spacing={2.5}>
                    <Stack pt="1rem">
                        <Button
                            fullWidth
                            variant="plain"
                            onClick={() =>
                                handlePageSwitch("user-settings", "profile")
                            }
                            color="neutral"
                            padding={5}
                            horizontalAlign="left"
                        >
                            <Stack
                                width="100%"
                                flex={1}
                                direction="row"
                                alignItems="center"
                                spacing={1.875}
                            >
                                <UserAvatar size={48} user={app.account} />
                                <Stack
                                    spacing={0.625}
                                    justifyContent="flex-start"
                                    alignItems="flex-start"
                                    direction="column"
                                >
                                    <Typography level="body-md">
                                        {app.account.displayName}
                                    </Typography>
                                    <Typography
                                        textColor="muted"
                                        level="body-xs"
                                        justifyContent="center"
                                        alignItems="center"
                                        display="flex"
                                        direction="row"
                                        spacing={1}
                                    >
                                        Edit Profiles
                                        <FaPencil css={{ marginBottom: 5 }} />
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Button>
                    </Stack>

                    {categories.map(([category, pages], index) => (
                        <Fragment
                            key={`settings-sidebar-category-fragment-${category}`}
                        >
                            <Stack direction="column">
                                <Typography
                                    level="body-sm"
                                    textColor="muted"
                                    mb={1.25}
                                >
                                    {startCase(category)}
                                </Typography>
                                <ButtonGroup
                                    color="neutral"
                                    orientation="vertical"
                                    variant="plain"
                                    spacing={1.25}
                                    horizontalAlign="left"
                                >
                                    {pages.map((page) => (
                                        <Button
                                            startDecorator={page.icon}
                                            onClick={() =>
                                                handlePageSwitch(
                                                    category as UserSettingsCategories,
                                                    page.label,
                                                )
                                            }
                                            key={`user-settings-sidebar-${page.label}`}
                                            variant={
                                                currentPage === page.label
                                                    ? "soft"
                                                    : "plain"
                                            }
                                            padding={5}
                                            disabled={
                                                currentPage === page.label
                                            }
                                        >
                                            {startCase(page.label)}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            </Stack>
                            {index < categories.length - 1 && (
                                <Divider
                                    css={{
                                        opacity: 0.25,
                                    }}
                                    lineColor="muted"
                                />
                            )}
                        </Fragment>
                    ))}
                </Stack>
                <Stack direction="column" pb="1rem">
                    <Button
                        color="neutral"
                        variant="plain"
                        startDecorator={<FaSignOutAlt />}
                        horizontalAlign="left"
                        onClick={() => app.logout()}
                    >
                        Log out
                    </Button>
                </Stack>
            </Paper>
        );
    },
);
