import {
    useSettingsSidebar,
    type SettingsSidebarCategories,
    type SettingsSidebarPage,
} from "@contexts/SettingsSidebar.context";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    ButtonGroup,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react";
import { Fragment, type JSX } from "react";
import { FaPaintBrush, FaPalette, FaUserCog } from "react-icons/fa";
import { UserAvatar } from "../User/UserAvatar";

interface UserSettingsSidebarProps {
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
    label: SettingsSidebarPage;
    icon: JSX.Element;
}

type SettingsPages = Record<SettingsSidebarCategories, Pages[]>;

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
            useSettingsSidebar();

        const handlePageSwitch = (
            category: SettingsSidebarCategories,
            page: SettingsSidebarPage,
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
                width="100%"
                height="100%"
                minWidth={175}
                maxWidth={175}
                elevation={2}
                spacing={10}
            >
                <Stack px="1rem" pt="1rem">
                    <Button
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
                            justifyContent="center"
                            alignItems="center"
                            flex={1}
                            direction="row"
                            spacing={7.5}
                        >
                            <UserAvatar user={app.account} />
                            <Stack
                                spacing={2.5}
                                justifyContent="flex-start"
                                alignItems="flex-start"
                                direction="column"
                            >
                                <Typography level="body-sm">
                                    {app.account.globalName ??
                                        app.account.username}
                                </Typography>
                                <Typography
                                    textColor="muted"
                                    level="body-xs"
                                    justifyContent="center"
                                    alignItems="center"
                                    display="flex"
                                    direction="row"
                                    spacing={2}
                                >
                                    <FaPaintBrush />
                                    Edit Profiles
                                </Typography>
                            </Stack>
                        </Stack>
                    </Button>
                </Stack>
                <Divider lineColor="primary" />
                {categories.map(([category, pages], index) => (
                    <Fragment
                        key={`settings-sidebar-category-fragment-${category}`}
                    >
                        <Stack px="1rem" direction="column">
                            <Typography
                                level="body-xs"
                                textColor="muted"
                                mb={5}
                            >
                                {startCase(category)}
                            </Typography>
                            <ButtonGroup
                                color="neutral"
                                size={{ xs: "sm", sm: "md" }}
                                orientation="vertical"
                                variant="plain"
                                spacing={5}
                            >
                                {pages.map((page) => (
                                    <Button
                                        startDecorator={page.icon}
                                        onClick={() =>
                                            handlePageSwitch(
                                                category as SettingsSidebarCategories,
                                                page.label,
                                            )
                                        }
                                        key={`user-settings-sidebar-${page.label}`}
                                        horizontalAlign="left"
                                        variant={
                                            currentPage === page.label
                                                ? "soft"
                                                : "plain"
                                        }
                                        padding={5}
                                    >
                                        {startCase(page.label)}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Stack>
                        {index < categories.length - 1 && (
                            <Divider lineColor="primary" />
                        )}
                    </Fragment>
                ))}
            </Paper>
        );
    },
);
