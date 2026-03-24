import { ContextMenu } from "@components/ContextMenu.tsx";
import { ContextSubmenu } from "@components/ContextSubmenu.tsx";
import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { Box, Stack } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space.ts";
import { observer } from "mobx-react-lite";
import { type Dispatch, type SetStateAction, useMemo } from "react";
import { FaArrowRight, FaDoorOpen } from "react-icons/fa";
import {
    type Page,
    settingsPages,
} from "@components/SpaceSettings/SpaceSettingsSidebar.tsx";
import startCase from "lodash-es/startCase";
import { generateMenuIDs } from "@contexts/ContextMenu.context.tsx";
import { SpaceActionConfirm } from "@components/Modals/SpaceActionConfirm.tsx";
import { ContextItem } from "@components/ContextItem.tsx";
import type { SpaceSettingsCategories } from "@components/SpaceSettings/SpaceSettings.context.tsx";

interface Props {
    space: Space;
    fromSidebar?: boolean;
    setMenuOpen?: Dispatch<SetStateAction<boolean>>;
}

// TODO: add a determinate category and page visibility
export const SpaceContextMenu = observer(
    ({ space, fromSidebar, setMenuOpen }: Props) => {
        const app = useAppStore();
        const { openModal } = useModal();

        const canModifySpace = useMemo(
            () =>
                space.members.me?.hasAnyPermission([
                    "ManageSpace",
                    "ManageChannels",
                    "ManageRoles",
                ]),
            [space.members.me],
        );

        const spaceSettings = useMemo(
            () => (canModifySpace ? Object.entries(settingsPages) : null),
            [canModifySpace],
        );

        const onVisibilityChange = (visible: boolean) => {
            setMenuOpen?.(visible);
        };

        const isOwner = space.ownerId === app.account?.id;

        const shouldShowCategory = (category: SpaceSettingsCategories) => {
            return settingsPages[category].some((page) =>
                space.members.me?.hasAnyPermission(page.permissions),
            );
        };

        const shouldShowPage = (page: Page) => {
            return space.members.me?.hasAnyPermission(page.permissions);
        };

        return (
            <ContextMenu
                elevation={app.settings?.preferEmbossed ? 5 : 1}
                transparency={0}
                id={generateMenuIDs.space(space.id, fromSidebar)}
                onVisibilityChange={onVisibilityChange}
                key={space.id}
            >
                {canModifySpace && spaceSettings && (
                    <Stack direction="column" spacing={1.25}>
                        {spaceSettings.map(([category, pages]) => (
                            <Box
                                key={`context-menu-settings-category-${category}`}
                            >
                                {shouldShowCategory(
                                    category as SpaceSettingsCategories,
                                ) && (
                                    <ContextSubmenu
                                        label={startCase(category)}
                                        arrow={<FaArrowRight />}
                                        elevation={
                                            app.settings?.preferEmbossed ? 5 : 1
                                        }
                                        transparency={0}
                                        onClick={() =>
                                            openModal(
                                                `space-settings-${pages[0].label}-${space.id}`,
                                                <SpaceSettingsModal
                                                    space={space}
                                                    redirectTo={pages[0].label}
                                                />,
                                            )
                                        }
                                    >
                                        {pages.map(
                                            (page) =>
                                                shouldShowPage(page) && (
                                                    <ContextItem
                                                        id={`space-settings-${page.label}-${space.id}`}
                                                        key={`context-menu-settings-page-${page.label}`}
                                                        onClick={() =>
                                                            openModal(
                                                                `space-settings-${space.id}`,
                                                                <SpaceSettingsModal
                                                                    space={
                                                                        space
                                                                    }
                                                                    redirectTo={
                                                                        page.label
                                                                    }
                                                                />,
                                                            )
                                                        }
                                                        endDecorator={page.icon}
                                                    >
                                                        {startCase(page.label)}
                                                    </ContextItem>
                                                ),
                                        )}
                                    </ContextSubmenu>
                                )}
                            </Box>
                        ))}
                    </Stack>
                )}
                {!isOwner && (
                    <ContextItem
                        color="danger"
                        endDecorator={<FaDoorOpen />}
                        onClick={() =>
                            openModal(
                                "leave-space-confirm",
                                <SpaceActionConfirm
                                    space={space}
                                    action="leave"
                                />,
                            )
                        }
                        id={`space-leave-${space.id}`}
                        textColor={undefined}
                    >
                        Leave Server
                    </ContextItem>
                )}
            </ContextMenu>
        );
    },
);
