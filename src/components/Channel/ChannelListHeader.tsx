import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { type MouseEvent, useState } from "react";
import { useAppStore } from "@hooks/useStores.ts";
import { useMenu } from "@contexts/ContextMenu.context.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import type { Space } from "@stores/objects/Space.ts";
import { contextMenu } from "@mutualzz/contexify";
import {
    ButtonGroup,
    Portal,
    Stack,
    Tooltip,
    Typography,
} from "@mutualzz/ui-web";
import { IconButton } from "@components/IconButton.tsx";
import { TooltipWrapper } from "@components/TooltipWrapper.tsx";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { FaChevronDown, FaCogs, FaUserPlus } from "react-icons/fa";
import { SpaceContextMenu } from "@components/ContextMenus/SpaceContextMenu.tsx";
import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal.tsx";

interface Props {
    space: Space;
}

export const ChannelListHeader = observer(({ space }: Props) => {
    const app = useAppStore();
    const { openContextMenu } = useMenu();

    const [menuOpen, setMenuOpen] = useState(false);
    const { openModal } = useModal();

    const activeChannel = app.channels.active;

    const canInvite = space.members.me?.hasPermission("CreateInvites");
    const canManage = space.members.me?.hasAnyPermission([
        "ManageSpace",
        "ManageRoles",
    ]);

    const showSpaceMenu = (e: MouseEvent) => {
        if (!e.currentTarget) return;
        const isClick = e.type === "click";
        const rect = e.currentTarget.getBoundingClientRect();

        if (isClick) {
            openContextMenu(
                e,
                { type: "space", space },
                {
                    x: Math.round(rect.left + rect.width / 2 - 70),
                    y: Math.round(rect.bottom + 5),
                },
            );
            return;
        }

        openContextMenu(e, { type: "space", space });
    };

    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        if (menuOpen) contextMenu.hideAll();
        else showSpaceMenu(e);
    };

    return (
        <>
            <Paper
                elevation={app.settings?.preferEmbossed ? 5 : 0}
                borderLeft="0 !important"
                borderRight="0 !important"
                borderTop="0 !important"
                width="100%"
                maxHeight="2.95rem"
                height="100%"
                alignItems="center"
                p={2}
                justifyContent="space-between"
                onContextMenu={showSpaceMenu}
                onClick={handleClick}
                css={{
                    cursor: "pointer",
                }}
            >
                <Typography level="body-sm">{space.name}</Typography>
                <Stack
                    justifyContent="flex-end"
                    direction="row"
                    spacing={1}
                    alignItems="center"
                >
                    <ButtonGroup spacing={2} variant="plain" size={12}>
                        {canManage && (
                            <Tooltip
                                content={
                                    <TooltipWrapper>
                                        Space Settings
                                    </TooltipWrapper>
                                }
                                placement="bottom"
                            >
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal(
                                            `space-settings-${space.id}`,
                                            <SpaceSettingsModal
                                                space={space}
                                            />,
                                        );
                                    }}
                                    size={16}
                                >
                                    <FaCogs />
                                </IconButton>
                            </Tooltip>
                        )}

                        {canInvite && (
                            <Tooltip
                                content={
                                    <TooltipWrapper>
                                        Invite to Space
                                    </TooltipWrapper>
                                }
                                placement="bottom"
                            >
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal(
                                            `invite-to-space-${space.id}`,
                                            <SpaceInviteToSpaceModal
                                                channel={activeChannel}
                                            />,
                                        );
                                    }}
                                    size={16}
                                >
                                    <FaUserPlus />
                                </IconButton>
                            </Tooltip>
                        )}

                        <IconButton>
                            {menuOpen ? (
                                <FaChevronDown
                                    style={{ transform: "rotate(180deg)" }}
                                />
                            ) : (
                                <FaChevronDown />
                            )}
                        </IconButton>
                    </ButtonGroup>
                </Stack>
            </Paper>
            <Portal>
                <SpaceContextMenu space={space} setMenuOpen={setMenuOpen} />
            </Portal>
        </>
    );
});
