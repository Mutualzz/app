import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useModal } from "@contexts/Modal.context";
import { ContextMenu } from "@components/ContextMenu";
import { Channel } from "@stores/objects/Channel";
import { ContextItem } from "@components/ContextItem";
import { Divider } from "@mutualzz/ui-web";
import { NotePencilIcon, SignOutIcon, TrashIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { GroupDMEditModal } from "@components/DMChannel/GroupDMEditModal";
import { ChannelNotificationSettingsMenu } from "@components/Channel/ChannelNotificationSettingsMenu";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

export const GroupDMContextMenu = observer(({ channel }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { t } = useTranslation("chat");

  const readState = app.readStates.get(channel.id);
  const isOwner = !!channel.ownerId && channel.ownerId === app.account?.id;

  const onLeft = () => {
    navigate({ to: "/@me", replace: true });
    app.channels.remove(channel.id);
  };

  const { mutate: leaveGroup, isPending: isLeaving } = useMutation({
    mutationKey: ["leave-group-dm", channel.id],
    mutationFn: () => app.channels.leaveGroupDM(channel.id),
    onSuccess: onLeft
  });

  const { mutate: deleteGroup, isPending: isDeleting } = useMutation({
    mutationKey: ["delete-group-dm", channel.id],
    mutationFn: () => app.channels.deleteGroupDM(channel.id),
    onSuccess: onLeft
  });

  const isPending = isLeaving || isDeleting;

  return (
    <ContextMenu
      transparency={0}
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      id={`group-dm-${channel.id}`}
      key={channel.id}
    >
      {readState && (
        <>
          <ContextItem
            onClick={() => readState.ack()}
            disabled={!readState.isUnread}
          >
            {t("contextMenu.markAsRead")}
          </ContextItem>
          <ChannelNotificationSettingsMenu channel={channel} />
          <Divider css={{ opacity: 0.5 }} />
        </>
      )}

      {isOwner && (
        <ContextItem
          onClick={() =>
            openModal(
              `edit-group-dm-${channel.id}`,
              <GroupDMEditModal channel={channel} />
            )
          }
          endDecorator={<NotePencilIcon weight="fill" />}
        >
          {t("contextMenu.editGroup")}
        </ContextItem>
      )}

      <ContextItem
        onClick={() => leaveGroup()}
        disabled={isPending}
        endDecorator={<SignOutIcon weight="fill" />}
      >
        {t("contextMenu.leaveGroup")}
      </ContextItem>

      {isOwner && (
        <ContextItem
          onClick={() => deleteGroup()}
          disabled={isPending}
          color="danger"
          endDecorator={<TrashIcon weight="fill" />}
        >
          {t("contextMenu.deleteGroup")}
        </ContextItem>
      )}
    </ContextMenu>
  );
});
