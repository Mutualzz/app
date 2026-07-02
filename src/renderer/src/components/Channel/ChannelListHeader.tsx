import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { type MouseEvent, useState } from "react";
import { useAppStore } from "@hooks/useStores";
import { useMenu } from "@contexts/ContextMenu.context";
import { useModal } from "@contexts/Modal.context";
import type { Space } from "@stores/objects/Space";
import { contextMenu } from "@mutualzz/contexify";
import { Box, ButtonGroup, Portal, Stack, Typography } from "@mutualzz/ui-web";
import { IconButton } from "@components/IconButton";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal";
import { SpaceContextMenu } from "@components/ContextMenu/SpaceContextMenu";
import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal";
import { CaretDownIcon, GearIcon, UserPlusIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";

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
    "ManageRoles"
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
          y: Math.round(rect.bottom + 5)
        }
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
        direction="row"
        alignItems="center"
        p={2.5}
        justifyContent="space-between"
        onContextMenu={showSpaceMenu}
        onClick={handleClick}
        css={{
          cursor: "pointer"
        }}
        minWidth={0}
      >
        <Typography
          level="label-sm"
          weight="bold"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          overflow="hidden"
          maxWidth={150}
        >
          {space.name}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.25}
          minWidth={0}
          justifyContent="flex-end"
          flexWrap="nowrap"
        >
          {canManage && (
            <Tooltip content="Space Settings" placement="bottom">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(
                    `space-settings-${space.id}`,
                    <SpaceSettingsModal space={space} />
                  );
                }}
                size={12}
              >
                <GearIcon weight="fill" />
              </IconButton>
            </Tooltip>
          )}

          {canInvite && (
            <Tooltip content="Invite to Space" placement="bottom">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(
                    `invite-to-space-${space.id}`,
                    <SpaceInviteToSpaceModal channel={activeChannel} />
                  );
                }}
                size={12}
              >
                <UserPlusIcon weight="fill" />
              </IconButton>
            </Tooltip>
          )}

          <IconButton size={12}>
            <CaretDownIcon
              weight="bold"
              css={{
                transform: menuOpen ? "rotate(180deg)" : "none"
              }}
            />
          </IconButton>
        </Stack>
      </Paper>
      <Portal>
        <SpaceContextMenu space={space} setMenuOpen={setMenuOpen} />
      </Portal>
    </>
  );
});
