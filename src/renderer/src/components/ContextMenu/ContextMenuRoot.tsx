import { observer } from "mobx-react-lite";
import { Portal } from "@mutualzz/ui-web";
import { useMenu } from "@contexts/ContextMenu.context";

import { SpaceContextMenu } from "@components/ContextMenu/SpaceContextMenu";
import { ChannelListContextMenu } from "@components/ContextMenu/ChannelListContextMenu";
import { RoleContextMenu } from "@components/ContextMenu/RoleContextMenu";
import { ChannelItemContextMenu } from "@components/ContextMenu/ChannelItemContextMenu";
import { UserContextMenu } from "@components/ContextMenu/UserContextMenu";
import { AccountContextMenu } from "@components/ContextMenu/AccountContextMenu/AccountContextMenu";
import { EmojiContextMenu } from "@components/ContextMenu/EmojiContextMenu";
import { StickerContextMenu } from "@components/ContextMenu/StickerContextMenu";
import { GroupDMContextMenu } from "@components/ContextMenu/GroupDMContextMenu";
import { MessageContextMenu } from "@components/ContextMenu/MessageContextMenu";
import { CommentContextMenu } from "@components/ContextMenu/CommentContextMenu";
import { EditableContextMenu } from "@components/ContextMenu/EditableContextMenu";

export const ContextMenuRoot = observer(() => {
  const { menu } = useMenu();
  if (!menu) return null;

  switch (menu.type) {
    case "space":
      return (
        <Portal>
          <SpaceContextMenu {...menu} />
        </Portal>
      );
    case "channel-list":
      return (
        <Portal>
          <ChannelListContextMenu {...menu} />
        </Portal>
      );
    case "channel":
      return (
        <Portal>
          <ChannelItemContextMenu {...menu} />
        </Portal>
      );
    case "account":
      return (
        <Portal>
          <AccountContextMenu {...menu} />
        </Portal>
      );

    case "user":
      return (
        <Portal>
          <UserContextMenu {...menu} />
        </Portal>
      );

    case "role":
      return (
        <Portal>
          <RoleContextMenu {...menu} />
        </Portal>
      );
    case "emoji":
      return (
        <Portal>
          <EmojiContextMenu {...menu} />
        </Portal>
      );

    case "sticker":
      return (
        <Portal>
          <StickerContextMenu {...menu} />
        </Portal>
      );

    case "group-dm":
      return (
        <Portal>
          <GroupDMContextMenu {...menu} />
        </Portal>
      );

    case "message":
      return (
        <Portal>
          <MessageContextMenu {...menu} />
        </Portal>
      );

    case "comment":
      return (
        <Portal>
          <CommentContextMenu {...menu} />
        </Portal>
      );

    case "editable":
      return (
        <Portal>
          <EditableContextMenu {...menu} />
        </Portal>
      );

    default:
      return null;
  }
});
