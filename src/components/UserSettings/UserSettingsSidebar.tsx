import { Paper } from "@components/Paper";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
    type UserSettingsCategories,
    type UserSettingsPage,
    useUserSettings,
} from "@components/UserSettings/UserSettings.context.tsx";
import { useAppStore } from "@hooks/useStores";
import {
    Box,
    ButtonGroup,
    Divider,
    Link,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { Fragment, type JSX } from "react";
import {
    FaMicrophone,
    FaPaintBrush,
    FaPalette,
    FaSignOutAlt,
    FaUserCog,
} from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { UserAvatar } from "../User/UserAvatar";
import { Button } from "@components/Button";
import { isTauri } from "@utils/index";

interface UserSettingsSidebarProps {
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
    label: UserSettingsPage;
    title?: string;
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
        {
            label: "voice_and_video",
            title: "Voice & Video",
            icon: <FaMicrophone />,
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
                                    color="info"
                                    orientation="vertical"
                                    variant="plain"
                                    spacing={5}
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
                                            {page.title ??
                                                startCase(page.label)}
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
                        color="danger"
                        variant="plain"
                        startDecorator={<FaSignOutAlt />}
                        horizontalAlign="left"
                        onClick={() => app.logout()}
                    >
                        Log out
                    </Button>
                </Stack>

                <Box mb={5} fontFamily="monospace">
                    <Stack direction="column" mb={2}>
                        <Typography level="body-xs" textColor="muted">
                            Mutualzz v{app.versions.app}
                        </Typography>
                        {isTauri && (
                            <Typography level="body-xs" textColor="muted">
                                Tauri v{app.versions.tauri}
                            </Typography>
                        )}
                    </Stack>
                    <Stack fontFamily="monospace">
                        <Link
                            href={
                                !isTauri
                                    ? "https://mutualzz.com/privacy"
                                    : undefined
                            }
                            target={!isTauri ? "_blank" : undefined}
                            level="body-xs"
                            onClick={async (e) => {
                                if (isTauri) {
                                    e.preventDefault();
                                    openUrl("https://mutualzz.com/privacy");
                                }
                            }}
                            variant="plain"
                            color="info"
                        >
                            Privacy Policy
                        </Link>
                    </Stack>
                </Box>
            </Paper>
        );
    },
);
