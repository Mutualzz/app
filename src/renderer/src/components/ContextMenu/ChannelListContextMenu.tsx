import { ContextMenu } from "@components/ContextMenu";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Box } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { CategoryCreateModal } from "../Channel/Category/CategoryCreateModal";
import { ChannelCreateModal } from "../Channel/ChannelCreateModal";
import { generateMenuIDs } from "@contexts/ContextMenu.context";
import { ContextItem } from "@components/ContextItem";
import {
  ClipboardIcon,
  HashIcon,
  PaperPlaneTiltIcon
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface Props {
  space: Space;
}

export const ChannelListContextMenu = observer(({ space }: Props) => {
  const app = useAppStore();
  const { openModal } = useModal();
  const { t } = useTranslation("chat");

  const canManageChannels = space.members.me?.hasPermission("ManageChannels");
  const canInvite = space.members.me?.hasPermission("CreateInvites");

  return (
    <ContextMenu
      id={generateMenuIDs.channelList(space.id)}
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      transparency={0}
      key={space.id}
    >
      {canManageChannels && (
        <Box>
          <ContextItem
            onClick={() =>
              openModal("create-channel", <ChannelCreateModal space={space} />)
            }
            endDecorator={<HashIcon />}
          >
            {t("contextMenu.createChannel")}
          </ContextItem>
          <ContextItem
            onClick={() =>
              openModal(
                "create-category",
                <CategoryCreateModal space={space} />
              )
            }
            endDecorator={<ClipboardIcon weight="fill" />}
          >
            {t("contextMenu.createCategory")}
          </ContextItem>
        </Box>
      )}
      {canInvite && (
        <ContextItem
          onClick={() =>
            openModal(
              `invite-to-space-${space.id}`,
              <SpaceInviteToSpaceModal />
            )
          }
          endDecorator={<PaperPlaneTiltIcon weight="fill" />}
        >
          {t("contextMenu.inviteToSpace")}
        </ContextItem>
      )}
    </ContextMenu>
  );
});
