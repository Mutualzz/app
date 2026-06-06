import { Paper } from "@components/Paper";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges
} from "@dnd-kit/modifiers";
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
import { ChannelListItem } from "./ChannelListItem";
import { ChannelListContextMenu } from "@components/ContextMenu/ChannelListContextMenu";
import { useMenu } from "@contexts/ContextMenu.context";
import { ChannelListHeader } from "@components/Channel/ChannelListHeader";

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
          marginTop: channel.type === ChannelType.Category ? "1rem" : "0.5rem"
        }}
        {...attributes}
        {...listeners}
      >
        <ChannelListItem
          channel={channel}
          space={space}
          active={active}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
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

export const ChannelList = observer(() => {
  const app = useAppStore();
  const { openContextMenu } = useMenu();

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
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
              type: "channelList",
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
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
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
          </DndContext>
        </Stack>
      </Paper>
      <Portal>
        <ChannelListContextMenu space={space} />
      </Portal>
    </>
  );
});
