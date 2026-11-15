import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { PROFILE_BLOCK_ITEMS } from "@components/Profile/editor/ProfileBlockPalette";
import { sortBlocksByZIndex } from "@components/Profile/viewer/profileLayout.utils";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { APIProfileBlock } from "@mutualzz/types";
import { formatColor, isProfileBlockOnlyMe } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  expandSelectionToGroups,
  getGroupedBlockIds
} from "@components/Profile/editor/utils/profileBlockGroups.utils";
import {
  BoundingBoxIcon,
  DotsSixVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
  LockSimpleIcon,
  LockSimpleOpenIcon
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

const PREVIEW_LENGTH = 24;

const getBlockPreview = (block: APIProfileBlock) => {
  if (block.type !== "text" && block.type !== "quote") return null;

  const preview = block.content.replace(/\s+/g, " ").trim();
  if (!preview) return null;

  return preview.length > PREVIEW_LENGTH
    ? `${preview.slice(0, PREVIEW_LENGTH)}…`
    : preview;
};

interface LayerRowProps {
  block: APIProfileBlock;
  selected: boolean;
  grouped: boolean;
  onSelect: (blockId: string, additive: boolean) => void;
  onSelectGroup: (blockId: string) => void;
  onToggleLocked: (blockId: string) => void;
  onToggleHidden: (blockId: string) => void;
}

const LayerRow = ({
  block,
  selected,
  grouped,
  onSelect,
  onSelectGroup,
  onToggleLocked,
  onToggleHidden
}: LayerRowProps) => {
  const { t } = useTranslation("settings");
  const { theme } = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const icon = PROFILE_BLOCK_ITEMS.find(
    (item) => item.type === block.type
  )?.icon;
  const preview = getBlockPreview(block);
  const onlyMe = isProfileBlockOnlyMe(block);
  const lockLabel = block.locked
    ? t("profile.inspector.layers.unlock")
    : t("profile.inspector.layers.lock");
  const visibilityLabel = onlyMe
    ? t("profile.inspector.layers.show")
    : t("profile.inspector.layers.hide");

  return (
    <div
      ref={setNodeRef}
      onClick={(event) => onSelect(block.id, event.shiftKey)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      css={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 6px",
        borderRadius: 8,
        cursor: "pointer",
        userSelect: "none",
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        opacity: isDragging ? 0.6 : isProfileBlockOnlyMe(block) ? 0.45 : 1,
        background: selected
          ? formatColor(theme.colors.primary, { alpha: 15, format: "hexa" })
          : undefined
      }}
    >
      <span
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        css={{ display: "flex", cursor: "grab", opacity: 0.5 }}
      >
        <DotsSixVerticalIcon size={16} />
      </span>

      <span css={{ display: "flex", "& svg": { width: 14, height: 14 } }}>
        {icon}
      </span>

      <Typography
        level="body-sm"
        css={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {t(`profile.blocks.${block.type}`)}
        {preview && <span css={{ opacity: 0.6 }}> · {preview}</span>}
      </Typography>

      {grouped && (
        <Tooltip content={t("profile.inspector.layers.selectGroup")}>
          <IconButton
            size="sm"
            variant="plain"
            aria-label={t("profile.inspector.layers.selectGroup")}
            onClick={(event) => {
              event.stopPropagation();
              onSelectGroup(block.id);
            }}
          >
            <BoundingBoxIcon weight="bold" />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip content={lockLabel}>
        <IconButton
          size="sm"
          variant="plain"
          aria-label={lockLabel}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLocked(block.id);
          }}
        >
          {block.locked ? (
            <LockSimpleIcon weight="fill" />
          ) : (
            <LockSimpleOpenIcon />
          )}
        </IconButton>
      </Tooltip>

      <Tooltip content={visibilityLabel}>
        <IconButton
          size="sm"
          variant="plain"
          aria-label={visibilityLabel}
          onClick={(event) => {
            event.stopPropagation();
            onToggleHidden(block.id);
          }}
        >
          {onlyMe ? <EyeSlashIcon /> : <EyeIcon />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

interface Props {
  blocks: APIProfileBlock[];
  selectedBlockIds: string[];
  onBlocksChange: (blocks: APIProfileBlock[]) => void;
  onSelectionChange: (blockIds: string[]) => void;
}

export const ProfileLayersPanel = ({
  blocks,
  selectedBlockIds,
  onBlocksChange,
  onSelectionChange
}: Props) => {
  const { t } = useTranslation("settings");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );
  const layers = sortBlocksByZIndex(blocks).reverse();
  const groupedBlockIds = getGroupedBlockIds(blocks);

  const handleSelectGroup = (blockId: string) =>
    onSelectionChange(expandSelectionToGroups([blockId], blocks));

  const handleSelect = (blockId: string, additive: boolean) => {
    if (!additive) {
      onSelectionChange([blockId]);
      return;
    }

    onSelectionChange(
      selectedBlockIds.includes(blockId)
        ? selectedBlockIds.filter((selectedId) => selectedId !== blockId)
        : [...selectedBlockIds, blockId]
    );
  };

  const toggleLocked = (blockId: string) =>
    onBlocksChange(
      blocks.map((block) =>
        block.id === blockId ? { ...block, locked: !block.locked } : block
      )
    );

  const toggleHidden = (blockId: string) =>
    onBlocksChange(
      blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              hidden: undefined,
              visibility: isProfileBlockOnlyMe(block) ? undefined : "nobody"
            }
          : block
      )
    );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = layers.findIndex((block) => block.id === active.id);
    const newIndex = layers.findIndex((block) => block.id === over.id);
    const reordered = arrayMove(layers, oldIndex, newIndex);
    const zIndexById = new Map(
      reordered.map((block, index) => [block.id, reordered.length - 1 - index])
    );

    onBlocksChange(
      blocks.map((block) => ({
        ...block,
        zIndex: zIndexById.get(block.id) ?? block.zIndex
      }))
    );
  };

  if (layers.length === 0) {
    return (
      <Typography level="body-sm" css={{ opacity: 0.6 }}>
        {t("profile.inspector.layers.empty")}
      </Typography>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={layers.map((block) => block.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack direction="column" spacing={0.25}>
          {layers.map((block) => (
            <LayerRow
              key={block.id}
              block={block}
              selected={selectedBlockIds.includes(block.id)}
              grouped={groupedBlockIds.has(block.id)}
              onSelect={handleSelect}
              onSelectGroup={handleSelectGroup}
              onToggleLocked={toggleLocked}
              onToggleHidden={toggleHidden}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
};
