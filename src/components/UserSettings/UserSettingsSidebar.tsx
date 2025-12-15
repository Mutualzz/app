import { Paper } from "@components/Paper";
import {
    useUserSettingsSidebar,
    type UserSettingsSidebarCategories,
    type UserSettingsSidebarPage,
} from "@contexts/UserSettingsSidebar.context";
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
import { FaPaintBrush, FaPalette, FaUserCog } from "react-icons/fa";
import { UserAvatar } from "../User/UserAvatar";

interface UserSettingsSidebarProps {
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
    label: UserSettingsSidebarPage;
    icon: JSX.Element;
}

type SettingsPages = Record<UserSettingsSidebarCategories, Pages[]>;

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
            useUserSettingsSidebar();

        const handlePageSwitch = (
            category: UserSettingsSidebarCategories,
            page: UserSettingsSidebarPage,
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
                elevation={app.preferEmbossed ? 5 : 0}
                spacing={2.5}
                borderTop="0 !important"
                borderLeft="0 !important"
                borderBottom="0 !important"
            >
                <Stack px={2.5} width="100%" pt="1rem">
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
                                    spacing={0.5}
                                >
                                    <FaPaintBrush />
                                    Edit Profiles
                                </Typography>
                            </Stack>
                        </Stack>
                    </Button>
                </Stack>

                {categories.map(([category, pages], index) => (
                    <Fragment
                        key={`settings-sidebar-category-fragment-${category}`}
                    >
                        <Stack px="1rem" direction="column">
                            <Typography
                                level="body-sm"
                                textColor="muted"
                                mb={1.25}
                            >
                                {startCase(category)}
                            </Typography>
                            <ButtonGroup
                                color="neutral"
                                size="md"
                                orientation="vertical"
                                variant="plain"
                                spacing={1.25}
                            >
                                {pages.map((page) => (
                                    <Button
                                        startDecorator={page.icon}
                                        onClick={() =>
                                            handlePageSwitch(
                                                category as UserSettingsSidebarCategories,
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
                            <Divider
                                css={{
                                    paddingInline: "1rem",
                                    filter: "opacity(0.5)",
                                }}
                                lineColor="muted"
                            />
                        )}
                    </Fragment>
                ))}
            </Paper>
        );
    },
);
