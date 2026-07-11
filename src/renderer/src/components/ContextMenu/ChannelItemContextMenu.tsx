import { ContextMenu } from "@components/ContextMenu";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Divider } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { CategoryDeleteModal } from "../Channel/Category/CategoryDeleteModal";
import { ChannelType } from "@mutualzz/types";
import { generateMenuIDs } from "@contexts/ContextMenu.context";
import { ChannelActionConfirm } from "@components/Modals/ChannelActionConfirm";
import { ContextItem } from "@components/ContextItem";
import { GearIcon, PaperPlaneTiltIcon, TrashIcon } from "@phosphor-icons/react";
import { ChannelSettingsModal } from "@components/ChannelSettings/ChannelSettingsModal";
import { useTranslation } from "react-i18next";

interface Props {
  space: Space;
  channel: Channel;
}

export const ChannelItemContextMenu = observer(({ space, channel }: Props) => {
  const app = useAppStore();
  const { openModal } = useModal();
  const { t } = useTranslation("chat");

  const canModifyChannel = space.members.me?.hasPermission(
    "ManageChannels",
    channel
  );
  const canInvite = space.members.me?.hasPermission("CreateInvites", channel);

  const isCategory = channel.type === ChannelType.Category;

  const readState = app.readStates.get(channel.id);

  return (
    <ContextMenu
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      transparency={0}
      id={generateMenuIDs.channel(space.id, channel.id)}
      key={channel.id}
    >
      {readState && (
        <>
          <ContextItem
            onClick={() => readState.ack()}
            disabled={!readState?.isUnread}
          >
            {t("contextMenu.markAsRead")}
          </ContextItem>
          <Divider
            css={{
              opacity: 0.5
            }}
          />
        </>
      )}

      {!isCategory && canInvite && (
        <ContextItem
          onClick={() =>
            openModal(
              `invite-to-space-${space.id}`,
              <SpaceInviteToSpaceModal channel={channel} />
            )
          }
          endDecorator={<PaperPlaneTiltIcon weight="fill" />}
        >
          {t("contextMenu.inviteToChannel")}
        </ContextItem>
      )}

      {canModifyChannel && (
        <>
          <ContextItem
            onClick={() =>
              openModal(
                `channel-settings-${channel.id}`,
                <ChannelSettingsModal space={space} channel={channel} />
              )
            }
            size="sm"
            endDecorator={<GearIcon weight="fill" />}
          >
            {channel.type === ChannelType.Category
              ? t("contextMenu.editCategory")
              : t("contextMenu.editChannel")}
          </ContextItem>
          <ContextItem
            onClick={() =>
              isCategory && channel.hasChildren
                ? openModal(
                    `delete-category-${channel.id}`,
                    <CategoryDeleteModal channel={channel} />
                  )
                : openModal(
                    `delete-channel-${channel.id}`,
                    <ChannelActionConfirm channel={channel} />
                  )
            }
            color="danger"
            size="sm"
            endDecorator={<TrashIcon weight="fill" />}
          >
            {isCategory
              ? t("contextMenu.deleteCategory")
              : t("contextMenu.deleteChannel")}
          </ContextItem>
        </>
      )}
    </ContextMenu>
  );
});
