import {
    useSpaceSettingsSidebar,
    type SpaceSettingsSidebarCategories,
    type SpaceSettingsSidebarPage,
} from "@contexts/SpaceSettingsSidebar.context";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    ButtonGroup,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react";
import { Fragment, type JSX } from "react";
import { FaPaintBrush, FaPaperPlane } from "react-icons/fa";

interface SpaceSettingsSidebarProps {
    space: Space;
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
    label: SpaceSettingsSidebarPage;
    icon: JSX.Element;
}

type SettingsPages = Record<SpaceSettingsSidebarCategories, Pages[]>;

const settingsPages: SettingsPages = {
    general: [
        {
            label: "profile",
            icon: <FaPaintBrush />,
        },
    ],
    people: [
        {
            label: "invites",
            icon: <FaPaperPlane />,
        },
    ],
};

export const SpaceSettingsSidebar = observer(
    ({ space, drawerOpen, setDrawerOpen }: SpaceSettingsSidebarProps) => {
        const app = useAppStore();

        const { currentPage, setCurrentPage, setCurrentCategory } =
            useSpaceSettingsSidebar();

        const handlePageSwitch = (
            category: SpaceSettingsSidebarCategories,
            page: SpaceSettingsSidebarPage,
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
                spacing={2.5}
                pt="1rem"
            >
                {categories.map(([category, pages], index) => (
                    <Fragment
                        key={`settings-sidebar-category-fragment-${category}`}
                    >
                        <Stack px="1rem" direction="column">
                            {category === "general" ? (
                                <Typography
                                    level="body-lg"
                                    textColor="secondary"
                                    mb={1.25}
                                >
                                    {space.name}
                                </Typography>
                            ) : (
                                <Typography
                                    level="body-xs"
                                    textColor="muted"
                                    mb={1.25}
                                >
                                    {startCase(category)}
                                </Typography>
                            )}

                            <ButtonGroup
                                color="neutral"
                                size={{ xs: "sm", sm: "md" }}
                                orientation="vertical"
                                variant="plain"
                                spacing={1.25}
                            >
                                {pages.map((page) => (
                                    <Button
                                        startDecorator={page.icon}
                                        onClick={() =>
                                            handlePageSwitch(
                                                category as SpaceSettingsSidebarCategories,
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
