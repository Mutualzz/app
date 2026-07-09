import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { Paper } from "@components/Paper";
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
import { SpaceContextMenu } from "@components/ContextMenu/SpaceContextMenu";
import { useMenu } from "@contexts/ContextMenu.context";
import { IconButton } from "@components/IconButton";
import { PlusCircleIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import capitalize from "lodash-es/capitalize";

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
      if (app.spaces.activeId === space.id) return "active";
      if (isHovered) return "hover";
      if (space.channels.some((ch) => app.readStates.get(ch.id)?.isUnread))
        return "unread";
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
            <Stack justifyContent="center" position="relative">
              <SidebarPill type={pillType} />
              <SpaceIcon
                size={40}
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
            </Stack>
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
  const navigate = useNavigate();
  const app = useAppStore();
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

  const showUnreadDMsPill = app.mode !== "@me" && app.channels.hasUnreadDMs;
  const dmMentionCount =
    app.mode !== "@me" ? app.channels.dmMentionCount : 0;

  return (
    <Paper
      width="5rem"
      direction="column"
      pt={1}
      spacing={2.5}
      variant="plain"
      boxShadow="none !important"
      elevation={app.settings?.preferEmbossed ? 1 : 0}
      alignItems="center"
      height="100%"
    >
      <Stack width="100%" alignItems="center" justifyContent="center">
        <Tooltip
          content={`Switch to ${capitalize(
            app.mode === "@me"
              ? (app.settings?.preferredMode ?? "Spaces")
              : "Direct Messages"
          )}`}
          placement="right"
        >
          <Stack justifyContent="center" position="relative">
            <SidebarPill type={showUnreadDMsPill ? "unread" : "none"} />
            <AnimatedLogo
              css={{
                width: 48,
                cursor: "pointer",
                marginBottom: 5
              }}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                navigate({
                  to:
                    app.mode === "@me"
                      ? `/${app.settings?.preferredMode ?? "spaces"}`
                      : "/@me",
                  replace: true
                });
              }}
            />
            {dmMentionCount > 0 && (
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
            )}
          </Stack>
        </Tooltip>
      </Stack>

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
                if (app.spaces.activeId === space.id) return;
                app.spaces.setActive(space.id);
                app.spaces.setMostRecentSpace(space.id);
                navigate({
                  to: "/spaces/$spaceId",
                  params: {
                    spaceId: space.id
                  }
                });
              }}
              key={space.id}
              space={space}
              selected={app.spaces.activeId === space.id}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Stack>
        <Tooltip content="Create a space" placement="right">
          <IconButton
            size={36}
            css={{
              borderRadius: 9999
            }}
            variant="soft"
            onClick={() => openModal("space-invite", <SpaceInviteModal />)}
          >
            <PlusCircleIcon
              weight="fill"
              css={{
                padding: 4
              }}
            />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
});
