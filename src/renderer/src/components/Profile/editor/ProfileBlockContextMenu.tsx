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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("settings");
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
          {t("profile.blocks.alignHorizontally")}
        </ContextItem>
        <ContextItem
          size="sm"
          onClick={onAlignVertical}
          endDecorator={<AlignCenterVerticalIcon weight="bold" />}
        >
          {t("profile.blocks.alignVertically")}
        </ContextItem>
        <ContextItem
          size="sm"
          onClick={onSnapToGrid}
          endDecorator={<GridFourIcon weight="bold" />}
        >
          {t("profile.blocks.snapToGrid")}
        </ContextItem>
        <Divider lineColor="muted" />
        <ContextItem
          size="sm"
          color="danger"
          onClick={onDelete}
          endDecorator={<TrashIcon weight="bold" />}
        >
          {t("profile.blocks.deleteBlock")}
        </ContextItem>
      </ContextMenu>
    </Portal>
  );
};
