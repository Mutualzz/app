import { Paper } from "@components/Paper";
import {
  closestCenter,
  DndContext,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import { Portal, Stack } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ChannelListItem } from "./ChannelListItem";
import { VoiceMemberDragOverlay } from "./VoiceMemberDragOverlay";
import { ChannelListContextMenu } from "@components/ContextMenu/ChannelListContextMenu";
import { useMenu } from "@contexts/ContextMenu.context";
import { ChannelListHeader } from "@components/Channel/ChannelListHeader";
import { toast } from "react-toastify";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges
} from "@dnd-kit/modifiers";

interface SortableChannelItemProps {
  channel: Channel;
  active: boolean;
  isCollapsed: boolean;
  space: Space;
  onToggleCollapse?: () => void;
  canMoveChannels: boolean;
}

const SortableChannelItem = observer(
  ({
    channel,
    active,
    isCollapsed,
    space,
    onToggleCollapse,
    canMoveChannels
  }: SortableChannelItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({
      id: channel.id,
      data: {
        type: "channel",
        channelId: channel.id,
        spaceId: space.id
      },
      disabled: !canMoveChannels
    });

    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 999 : undefined,
          marginTop: channel.type === ChannelType.Category ? "1rem" : "0.375rem"
        }}
      >
        <ChannelListItem
          channel={channel}
          space={space}
          active={active}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          channelDragHandle={
            canMoveChannels ? { attributes, listeners } : undefined
          }
        />
      </div>
    );
  }
);

function flattenChannels(
  allChannels: Channel[],
  collapsedCategories: Set<string>
): Channel[] {
  const rootChannels = allChannels
    .filter((c) => !c.parentId)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const result: Channel[] = [];

  for (const channel of rootChannels) {
    result.push(channel);

    if (channel.type === ChannelType.Category) {
      const isCollapsed = collapsedCategories.has(channel.id);

      if (!isCollapsed) {
        const children = allChannels
          .filter((c) => c.parentId === channel.id)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        result.push(...children);
      }
    }
  }

  return result;
}

function getAllCategoryChildren(
  allChannels: Channel[],
  categoryId: string
): Channel[] {
  const category = allChannels.find((c) => c.id === categoryId);
  if (!category) return [];

  const children = allChannels.filter((c) => c.parentId === categoryId);
  return [category, ...children];
}

function resolveVoiceDropChannelId(
  over: DragEndEvent["over"],
  visibleChannels: Channel[]
): string | undefined {
  if (!over) return undefined;

  const overData = over.data.current;
  if (overData?.type === "voice-channel") {
    return overData.channelId as string;
  }

  if (overData?.type === "channel") {
    const channel = visibleChannels.find((c) => c.id === over.id);
    if (channel?.isVoiceChannel) return channel.id;
  }

  const overId = String(over.id);
  if (overId.startsWith("channel-drop:")) {
    return overId.slice("channel-drop:".length);
  }

  return undefined;
}

const voiceMemberCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  const voiceChannelHit = pointerHits.find((collision) =>
    String(collision.id).startsWith("channel-drop:")
  );
  if (voiceChannelHit) return [voiceChannelHit];

  return closestCenter(args);
};

export const ChannelList = observer(() => {
  const app = useAppStore();
  const { openContextMenu } = useMenu();
  const [activeDragType, setActiveDragType] = useState<string | null>(null);

  const inChannel = Boolean(app.channels.activeId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const space = app.spaces.active;
  if (!space) return null;

  const visibleChannels = space.visibleChannels;
  const activeChannel = app.channels.active;

  const collapsedCategories =
    app.channels.collapsedCategories.get(space.id) ?? new Set<string>();

  const flatChannels = flattenChannels(visibleChannels, collapsedCategories);

  const toggleCategory = (categoryId: string) => {
    app.channels.toggleCategoryCollapse(space.id, categoryId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type as string | undefined;
    setActiveDragType(type ?? null);
  };

  const clearDragState = () => {
    setActiveDragType(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current;

    try {
      if (!over) return;

      if (activeData?.type === "voice-member") {
        const targetChannelId = resolveVoiceDropChannelId(
          over,
          visibleChannels
        );

        if (!targetChannelId) return;
        if (targetChannelId === activeData.channelId) return;

        await app.rest.patch(
          `/spaces/${activeData.spaceId}/members/${activeData.userId}/voice`,
          { channelId: targetChannelId }
        );
        return;
      }

      if (active.id === over.id) return;

      const oldIndex = flatChannels.findIndex((c) => c.id === active.id);
      const newIndex = flatChannels.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      runInAction(() => {
        const movingChannel = flatChannels[oldIndex];

        let newOrder: Channel[];

        if (movingChannel.type === ChannelType.Category) {
          const group = getAllCategoryChildren(visibleChannels, movingChannel.id);

          newOrder = flatChannels.filter((c) => !group.includes(c));

          let insertAt = newIndex;
          if (newIndex > oldIndex) {
            const visibleGroupSize = group.filter((c) =>
              flatChannels.includes(c)
            ).length;
            insertAt = newIndex - visibleGroupSize + 1;
          }

          const visibleGroup = group.filter((c) => flatChannels.includes(c));
          newOrder.splice(insertAt, 0, ...visibleGroup);
        } else {
          newOrder = arrayMove(flatChannels, oldIndex, newIndex);
        }

        const completeOrder: Channel[] = [];
        let currentCategory: Channel | null = null;
        const siblingPositions = new Map<string | null, number>();

        for (const channel of newOrder) {
          if (channel.type === ChannelType.Category) {
            currentCategory = channel;
            channel.parentId = null;
          } else {
            channel.parentId = currentCategory?.id ?? null;
          }

          const parentKey = channel.parentId ?? null;
          const nextPosition = siblingPositions.get(parentKey) ?? 0;
          channel.position = nextPosition;
          siblingPositions.set(parentKey, nextPosition + 1);

          completeOrder.push(channel);
        }

        app.channels.setChannelOrder(space.id, completeOrder);
      });
    } catch (error) {
      if (activeData?.type === "voice-member") {
        toast.error(
          error instanceof Error ? error.message : "Failed to move member"
        );
      }
    } finally {
      clearDragState();
    }
  };

  const canMoveChannels =
    app.spaces.active?.members.me?.hasPermission("ManageChannels");

  return (
    <>
      <Paper
        borderRight={inChannel ? "0 !important" : undefined}
        borderBottom="0 !important"
        borderTopLeftRadius="0.75rem"
        direction="column"
        width="100%"
        elevation={app.settings?.preferEmbossed ? 4 : 0}
      >
        <ChannelListHeader space={space} />
        <Stack
          onContextMenu={(e) =>
            openContextMenu(e, {
              type: "channel-list",
              space
            })
          }
          flex={1}
          height="100%"
          direction="column"
          pt="2rem"
          css={{
            overflowX: "hidden"
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={
              activeDragType === "voice-member"
                ? voiceMemberCollisionDetection
                : closestCenter
            }
            modifiers={
              activeDragType === "channel"
                ? [restrictToVerticalAxis, restrictToWindowEdges]
                : undefined
            }
            onDragStart={handleDragStart}
            onDragCancel={clearDragState}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={flatChannels.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {flatChannels.map((channel) => (
                <SortableChannelItem
                  key={channel.id}
                  channel={channel}
                  space={space}
                  active={activeChannel?.id === channel.id}
                  isCollapsed={collapsedCategories.has(channel.id)}
                  onToggleCollapse={() => toggleCategory(channel.id)}
                  canMoveChannels={!!canMoveChannels}
                />
              ))}
            </SortableContext>
            <DragOverlay dropAnimation={null} zIndex={10000}>
              <VoiceMemberDragOverlay space={space} />
            </DragOverlay>
          </DndContext>
        </Stack>
      </Paper>
      <Portal>
        <ChannelListContextMenu space={space} />
      </Portal>
    </>
  );
});
