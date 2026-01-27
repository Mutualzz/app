import { Paper } from "@components/Paper";
import {
    type SpaceSettingsCategories,
    type SpaceSettingsPage,
    useSpaceSettings,
} from "@contexts/SpaceSettings.context";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    ButtonGroup,
    Divider,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { Fragment, type JSX } from "react";
import { FaPaintBrush, FaPaperPlane } from "react-icons/fa";

interface SpaceSettingsProps {
    space: Space;
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
    label: SpaceSettingsPage;
    icon: JSX.Element;
}

type SettingsPages = Record<SpaceSettingsCategories, Pages[]>;

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
    ({ space, drawerOpen, setDrawerOpen }: SpaceSettingsProps) => {
        const app = useAppStore();

        const { currentPage, setCurrentPage, setCurrentCategory } =
            useSpaceSettings();

        const handlePageSwitch = (
            category: SpaceSettingsCategories,
            page: SpaceSettingsPage,
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
                width={175}
                height="100%"
                elevation={app.settings?.preferEmbossed ? 5 : 0}
                spacing={2.5}
                p="1rem"
                borderTop="0 !important"
                borderLeft="0 !important"
                borderBottom="0 !important"
            >
                {categories.map(([category, pages], index) => (
                    <Fragment
                        key={`settings-sidebar-category-fragment-${category}`}
                    >
                        <Stack direction="column">
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
                                                category as SpaceSettingsCategories,
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
                                        disabled={currentPage === page.label}
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
            </Paper>
        );
    },
);
