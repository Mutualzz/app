import {
  SIDEBAR_RAIL_ITEM_SIZE,
  SidebarRailDivider,
  SidebarRailLogo,
  SidebarRailPaper,
  SidebarRailScroll,
  SidebarRailSlot
} from "@components/Navigation/SidebarRail";
import { type PillType, SidebarPill } from "@components/SidebarPill";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { SpaceInviteModal } from "@components/Space/SpaceInviteModal";
import { useModal } from "@contexts/Modal.context";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSObject } from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import { formatColor } from "@mutualzz/ui-core";
import { Portal, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SpaceContextMenu } from "@components/ContextMenu/SpaceContextMenu";
import { useMenu } from "@contexts/ContextMenu.context";
import { IconButton } from "@components/IconButton";
import { PlusCircleIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import { useBridgeListSync } from "@hooks/useBridgeListSync";
import { navigateToMode, navigateToSpace } from "@utils/index";

const SortableSpace = observer(
  ({
    space,
    onClick,
    selected
  }: {
    space: Space;
    onClick: () => void;
    selected: boolean;
  }) => {
    const app = useAppStore();
    const { openContextMenu } = useMenu();
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: space.id });
    const { theme } = useTheme();

    const [isHovered, setIsHovered] = useState(false);

    const pillType: PillType = (() => {
      if (selected) return "active";
      if (isHovered) return "hover";
      if (space.channels.some((ch) => app.readStates.get(ch.id)?.isUnread))
        return "unread";
      if (app.bridgeChat.hasUnreadForSpace(space.id)) return "unread";
      return "none";
    })();

    const style: CSSObject = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1
    };

    return (
      <>
        <div ref={setNodeRef} css={style} {...attributes} {...listeners}>
          <Tooltip
            content={space.name}
            paperProps={{
              borderRadius: 5,
              variant: "elevation",
              elevation: 3,
              boxShadow: "unset",
              css: {
                border: `1px solid ${formatColor(theme.colors.neutral, {
                  alpha: 30,
                  format: "hexa"
                })}`
              }
            }}
            typographyProps={{ level: "body-sm" }}
            placement="right"
          >
            <SidebarRailSlot
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              pill={<SidebarPill type={pillType} />}
            >
              <SpaceIcon
                size={SIDEBAR_RAIL_ITEM_SIZE}
                onContextMenu={(e) =>
                  openContextMenu(e, {
                    type: "space",
                    space,
                    fromSidebar: true
                  })
                }
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                space={space}
                onClick={onClick}
                selected={selected}
                css={{
                  cursor: isDragging ? "grabbing" : "pointer"
                }}
              />
            </SidebarRailSlot>
          </Tooltip>
        </div>
        <Portal>
          <SpaceContextMenu fromSidebar space={space} />
        </Portal>
      </>
    );
  }
);

export const SpacesSidebar = observer(() => {
  const { t } = useTranslation("space");
  const navigate = useNavigate();
  const app = useAppStore();
  useBridgeListSync();
  const { openModal } = useModal();
  const { theme } = useTheme();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = app.spaces.positioned.findIndex((s) => s.id === active.id);
    const newIndex = app.spaces.positioned.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      app.settings?.moveSpace(oldIndex, newIndex);
    }
  };

  const onDms = app.mode === "@me";
  const showUnreadDMsPill = !onDms && app.channels.hasUnreadDMs;
  const dmMentionCount = !onDms ? app.channels.dmMentionCount : 0;

  return (
    <SidebarRailPaper>
      <SidebarRailLogo
        tooltip={t("sidebar.directMessages")}
        active={onDms}
        unread={showUnreadDMsPill}
        onClick={() => {
          if (onDms) return;
          navigateToMode(app, navigate, "@me");
        }}
        badge={
          dmMentionCount > 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              css={{
                position: "absolute",
                top: -2,
                right: -2,
                minWidth: 16,
                height: 16,
                borderRadius: 9999,
                backgroundColor: theme.colors.danger,
                padding: "0 4px",
                border: `2px solid ${theme.colors.background}`
              }}
            >
              <Typography
                level="label-xs"
                css={{
                  color: "#fff",
                  fontSize: 10
                }}
              >
                {dmMentionCount > 99 ? "99+" : dmMentionCount}
              </Typography>
            </Stack>
          ) : undefined
        }
      />

      <SidebarRailDivider />

      <SidebarRailScroll>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={app.spaces.positioned.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {app.spaces.positioned.map((space) => (
              <SortableSpace
                onClick={() => {
                  if (app.mode === "spaces" && app.spaces.activeId === space.id)
                    return;
                  navigateToSpace(app, navigate, space.id);
                }}
                key={space.id}
                space={space}
                selected={
                  app.mode === "spaces" && app.spaces.activeId === space.id
                }
              />
            ))}
          </SortableContext>
        </DndContext>
      </SidebarRailScroll>

      <Tooltip content={t("sidebar.createSpace")} placement="right">
        <SidebarRailSlot>
          <IconButton
            size={36}
            css={{
              borderRadius: 9999
            }}
            variant="soft"
            onClick={() => openModal("space-invite", <SpaceInviteModal />)}
          >
            <PlusCircleIcon weight="fill" />
          </IconButton>
        </SidebarRailSlot>
      </Tooltip>
    </SidebarRailPaper>
  );
});
