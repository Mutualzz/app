import { FileDropZone } from "@components/FileDropZone";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import type { Channel } from "@stores/objects/Channel";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";

interface Props {
  channel: Channel;
  onDropFiles: (files: FileList | File[]) => void;
  children: ReactNode;
}

export const ChannelFileDropZone = observer(
  ({ channel, onDropFiles, children }: Props) => {
    const app = useAppStore();

    const isDM =
      channel.type === ChannelType.DM || channel.type === ChannelType.GroupDM;

    const relationship = isDM
      ? app.relationships.getForMe(channel.dmRecipient?.id ?? "")
      : null;

    const meId = app.account?.id;
    const iBlockedThem =
      !!relationship?.isBlocked && relationship.userId === meId;

    const denySendingMessages = isDM
      ? !!channel.dmRecipients.find(
          (r) => r.flags.has("System") || iBlockedThem
        )
      : !(
          app.spaces.get(channel.spaceId ?? "") ?? app.spaces.active
        )?.members.me?.canSendMessages(channel);

    const canAttachFiles = isDM
      ? !denySendingMessages
      : !!((
          app.spaces.get(channel.spaceId ?? "") ?? app.spaces.active
        )?.members.me?.canAttachFiles(channel) ?? false);

    return (
      <FileDropZone
        enabled={!denySendingMessages && canAttachFiles}
        onDropFiles={onDropFiles}
        direction="column"
        flex="1 1 auto"
        overflow="hidden"
        minHeight={0}
        minWidth={0}
      >
        {children}
      </FileDropZone>
    );
  }
);
