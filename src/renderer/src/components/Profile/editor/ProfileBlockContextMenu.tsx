import { ContextMenu } from "@components/ContextMenu";
import { ContextItem } from "@components/ContextItem";
import { useAppStore } from "@hooks/useStores";
import {
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  GridFourIcon,
  TrashIcon
} from "@phosphor-icons/react";
import { Divider, Portal } from "@mutualzz/ui-web";

export const PROFILE_BLOCK_MENU_ID = "profile-editor-block";

interface Props {
  onAlignHorizontal: () => void;
  onAlignVertical: () => void;
  onSnapToGrid: () => void;
  onDelete: () => void;
}

export const ProfileBlockContextMenu = ({
  onAlignHorizontal,
  onAlignVertical,
  onSnapToGrid,
  onDelete
}: Props) => {
  const app = useAppStore();

  return (
    <Portal>
      <ContextMenu
        id={PROFILE_BLOCK_MENU_ID}
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        transparency={0}
      >
        <ContextItem
          size="sm"
          onClick={onAlignHorizontal}
          endDecorator={<AlignCenterHorizontalIcon weight="bold" />}
        >
          Align horizontally
        </ContextItem>
        <ContextItem
          size="sm"
          onClick={onAlignVertical}
          endDecorator={<AlignCenterVerticalIcon weight="bold" />}
        >
          Align vertically
        </ContextItem>
        <ContextItem
          size="sm"
          onClick={onSnapToGrid}
          endDecorator={<GridFourIcon weight="bold" />}
        >
          Snap to grid
        </ContextItem>
        <Divider lineColor="muted" />
        <ContextItem
          size="sm"
          color="danger"
          onClick={onDelete}
          endDecorator={<TrashIcon weight="bold" />}
        >
          Delete block
        </ContextItem>
      </ContextMenu>
    </Portal>
  );
};
