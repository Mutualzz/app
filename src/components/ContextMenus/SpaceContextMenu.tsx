import { ContextMenu } from "@components/ContextMenu.tsx";
import { ContextSubmenu } from "@components/ContextSubmenu.tsx";
import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { Item } from "@mutualzz/contexify";
import { Box } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space.ts";
import { observer } from "mobx-react-lite";
import { type Dispatch, type SetStateAction, useMemo } from "react";
import { FaArrowRight, FaDoorOpen } from "react-icons/fa";
import { settingsPages } from "@components/SpaceSettings/SpaceSettingsSidebar.tsx";
import startCase from "lodash-es/startCase";
import { generateMenuIDs } from "@contexts/ContextMenu.context.tsx";
import { SpaceActionConfirm } from "@components/Modals/SpaceActionConfirm.tsx";

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
                    "ManageInvites",
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

        return (
            <ContextMenu
                elevation={app.settings?.preferEmbossed ? 5 : 1}
                transparency={0}
                id={generateMenuIDs.space(space.id, fromSidebar)}
                onVisibilityChange={onVisibilityChange}
                key={space.id}
            >
                {canModifySpace && spaceSettings && (
                    <Box>
                        <ContextSubmenu
                            onClick={() =>
                                openModal(
                                    `space-settings-${space.id}`,
                                    <SpaceSettingsModal space={space} />,
                                )
                            }
                            elevation={app.settings?.preferEmbossed ? 5 : 1}
                            transparency={0}
                            label="Server Settings"
                            arrow={<FaArrowRight />}
                        >
                            {spaceSettings.map(([category, pages]) => (
                                <Box
                                    key={`context-menu-settings-category-${category}`}
                                >
                                    <ContextSubmenu
                                        label={startCase(category)}
                                        arrow={<FaArrowRight />}
                                        elevation={
                                            app.settings?.preferEmbossed ? 5 : 1
                                        }
                                        transparency={0}
                                    >
                                        {pages.map((page) => (
                                            <Item
                                                id={`space-settings-${page.label}-${space.id}`}
                                                key={`context-menu-settings-page-${page.label}`}
                                                onClick={() =>
                                                    openModal(
                                                        `space-settings-${space.id}`,
                                                        <SpaceSettingsModal
                                                            space={space}
                                                            redirectTo={
                                                                page.label
                                                            }
                                                        />,
                                                    )
                                                }
                                                endDecorator={page.icon}
                                            >
                                                {startCase(page.label)}
                                            </Item>
                                        ))}
                                    </ContextSubmenu>
                                </Box>
                            ))}
                        </ContextSubmenu>
                    </Box>
                )}
                {!isOwner && (
                    <Item
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
                    >
                        Leave Server
                    </Item>
                )}
            </ContextMenu>
        );
    },
);
