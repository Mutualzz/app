import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import {
    type SpaceSettingsCategories,
    type SpaceSettingsPage,
    useSpaceSettings,
} from "@contexts/SpaceSettings.context";
import { useAppStore } from "@hooks/useStores";
import { ButtonGroup, Divider, Stack, Typography } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { Fragment, type JSX } from "react";
import { FaPaintBrush, FaPaperPlane, FaTrash } from "react-icons/fa";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import { SpaceActionConfirm } from "@components/Modals/SpaceActionConfirm.tsx";
import { useModal } from "@contexts/Modal.context.tsx";

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

export const settingsPages: SettingsPages = {
    general: [
        {
            label: "profile",
            icon: <FaPaintBrush />,
        },
    ],
    people: [
        {
            label: "roles",
            icon: <VscTypeHierarchySuper />,
        },
        {
            label: "invites",
            icon: <FaPaperPlane />,
        },
    ],
};

// TODO: add a determinate category and page visibility based on permissions
export const SpaceSettingsSidebar = observer(
    ({ space, drawerOpen, setDrawerOpen }: SpaceSettingsProps) => {
        const app = useAppStore();
        const { openModal } = useModal();

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
                py={5}
                px={2.5}
                borderTop="0 !important"
                borderLeft="0 !important"
                borderBottom="0 !important"
                justifyContent="space-between"
            >
                <Stack direction="column" spacing={2.5}>
                    {categories.map(([category, pages], index) => (
                        <Fragment
                            key={`settings-sidebar-category-fragment-${category}`}
                        >
                            <Stack direction="column">
                                {category === "general" ? (
                                    <Typography
                                        level="body-lg"
                                        textColor="accent"
                                        mb={2.5}
                                        fontFamily="monospace"
                                    >
                                        {space.name}
                                    </Typography>
                                ) : (
                                    <Typography
                                        level="body-xs"
                                        textColor="muted"
                                        mb={1.5}
                                    >
                                        {startCase(category)}
                                    </Typography>
                                )}

                                <ButtonGroup
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
                {space.ownerId === app.account.id && (
                    <Button
                        onClick={() =>
                            openModal(
                                `delete-space-confirm`,
                                <SpaceActionConfirm
                                    space={space}
                                    action="delete"
                                />,
                            )
                        }
                        color="danger"
                        variant="plain"
                        horizontalAlign="left"
                        endDecorator={<FaTrash />}
                    >
                        Delete Space
                    </Button>
                )}
            </Paper>
        );
    },
);
