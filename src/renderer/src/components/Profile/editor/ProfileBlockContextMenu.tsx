import { ContextMenu } from "@components/ContextMenu";
import { ContextItem } from "@components/ContextItem";
import { useAppStore } from "@hooks/useStores";
import {
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  ArrowRightIcon,
  BoundingBoxIcon,
  CopyIcon,
  GridFourIcon,
  SelectionSlashIcon,
  TrashIcon
} from "@phosphor-icons/react";
import { Divider, Portal } from "@mutualzz/ui-web";
import { useTranslation } from "react-i18next";
import {
  type BlockAlignment,
  type BlockDistribution
} from "./utils/profileBlockArrange.utils";
import { ContextSubmenu } from "@renderer/components/ContextSubmenu";
import {
  ALIGNMENT_OPTIONS,
  DISTRIBUTION_OPTIONS
} from "./ProfileMultiSelectPanel";

export const PROFILE_BLOCK_MENU_ID = "profile-editor-block";

interface Props {
  selectedCount: number;
  onAlignHorizontal: () => void;
  onAlignVertical: () => void;
  onSnapToGrid: () => void;
  onAlignSelection: (alignment: BlockAlignment) => void;
  onDistributeSelection: (distribution: BlockDistribution) => void;
  canGroup: boolean;
  canUngroup: boolean;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const ProfileBlockContextMenu = ({
  selectedCount,
  onAlignHorizontal,
  onAlignVertical,
  onSnapToGrid,
  onAlignSelection,
  onDistributeSelection,
  canGroup,
  canUngroup,
  onGroup,
  onUngroup,
  onDuplicate,
  onDelete
}: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const elevation = app.settings?.preferEmbossed ? 5 : 1;
  const isGroup = selectedCount > 1;

  return (
    <Portal>
      <ContextMenu id={PROFILE_BLOCK_MENU_ID} elevation={elevation}>
        {isGroup && (
          <ContextSubmenu
            label={t("profile.blocks.align")}
            arrow={<ArrowRightIcon weight="fill" />}
            elevation={elevation}
          >
            {ALIGNMENT_OPTIONS.map(({ alignment, IconComponent }) => (
              <ContextItem
                key={alignment}
                size="sm"
                onClick={() => onAlignSelection(alignment)}
                endDecorator={<IconComponent weight="bold" />}
              >
                {t(`profile.inspector.arrange.${alignment}`)}
              </ContextItem>
            ))}
          </ContextSubmenu>
        )}
        {isGroup && (
          <ContextSubmenu
            label={t("profile.blocks.distribute")}
            arrow={<ArrowRightIcon weight="fill" />}
            elevation={elevation}
          >
            {DISTRIBUTION_OPTIONS.map(({ distribution, IconComponent }) => (
              <ContextItem
                key={distribution}
                size="sm"
                disabled={selectedCount < 3}
                onClick={() => onDistributeSelection(distribution)}
                endDecorator={<IconComponent weight="bold" />}
              >
                {t(`profile.inspector.arrange.${distribution}`)}
              </ContextItem>
            ))}
          </ContextSubmenu>
        )}
        {!isGroup && (
          <ContextItem
            size="sm"
            onClick={onAlignHorizontal}
            endDecorator={<AlignCenterHorizontalIcon weight="bold" />}
          >
            {t("profile.blocks.alignHorizontally")}
          </ContextItem>
        )}
        {!isGroup && (
          <ContextItem
            size="sm"
            onClick={onAlignVertical}
            endDecorator={<AlignCenterVerticalIcon weight="bold" />}
          >
            {t("profile.blocks.alignVertically")}
          </ContextItem>
        )}
        {!isGroup && (
          <ContextItem
            size="sm"
            onClick={onSnapToGrid}
            endDecorator={<GridFourIcon weight="bold" />}
          >
            {t("profile.blocks.snapToGrid")}
          </ContextItem>
        )}
        {(canGroup || canUngroup) && <Divider lineColor="muted" />}
        {canGroup && (
          <ContextItem
            size="sm"
            onClick={onGroup}
            endDecorator={<BoundingBoxIcon weight="bold" />}
          >
            {t("profile.blocks.group")}
          </ContextItem>
        )}
        {canUngroup && (
          <ContextItem
            size="sm"
            onClick={onUngroup}
            endDecorator={<SelectionSlashIcon weight="bold" />}
          >
            {t("profile.blocks.ungroup")}
          </ContextItem>
        )}
        <Divider lineColor="muted" />
        <ContextItem
          size="sm"
          onClick={onDuplicate}
          endDecorator={<CopyIcon weight="bold" />}
        >
          {isGroup
            ? t("profile.blocks.duplicateBlocks", { count: selectedCount })
            : t("profile.blocks.duplicate")}
        </ContextItem>
        <Divider lineColor="muted" />
        <ContextItem
          size="sm"
          color="danger"
          onClick={onDelete}
          endDecorator={<TrashIcon weight="bold" />}
        >
          {isGroup
            ? t("profile.blocks.deleteBlocks", { count: selectedCount })
            : t("profile.blocks.deleteBlock")}
        </ContextItem>
      </ContextMenu>
    </Portal>
  );
};
