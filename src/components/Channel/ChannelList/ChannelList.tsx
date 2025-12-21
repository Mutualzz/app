import { Paper } from "@components/Paper";
import { SpaceContextMenu } from "@components/Space/SpaceContextMenu";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useModal } from "@contexts/Modal.context";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    restrictToParentElement,
    restrictToVerticalAxis,
    restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "@hooks/useStores";
import { contextMenu } from "@mutualzz/contexify";
import { ChannelType } from "@mutualzz/types";
import {
    ButtonGroup,
    IconButton,
    Portal,
    Stack,
    Tooltip,
    Typography,
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useState, type MouseEvent } from "react";
import { FaChevronDown, FaUserPlus } from "react-icons/fa";
import { ChannelListItem } from "../ChannelListItem/ChannelListItem";
import { ChannelListContextMenu } from "./ChannelListContextMenu";

const SortableChannelListItem = observer(
    ({
        channel,
        isCategory,
        active,
        isCollapsed,
        space,
        onToggleCollapse,
        ...props
    }: {
        channel: Channel;
        isCategory: boolean;
        active: boolean;
        isCollapsed: boolean;
        space: Space;
        onToggleCollapse?: () => void;
        [key: string]: any;
    }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({
            id: channel.id,
        });

        return (
            <div
                ref={setNodeRef}
                style={{
                    transform: CSS.Transform.toString(transform),
                    transition,
                    opacity: isDragging ? 0.5 : 1,
                    zIndex: isDragging ? 999 : undefined,
                    height: isCategory ? 32 : 28,
                }}
                {...attributes}
                {...listeners}
            >
                <ChannelListItem
                    channel={channel}
                    space={space}
                    isCategory={isCategory}
                    active={active}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={onToggleCollapse}
                    {...props}
                />
            </div>
        );
    },
);

function flattenChannels(channels: Channel[]) {
    const result: Channel[] = [];
    for (const channel of channels) {
        result.push(channel);
        if (channel.type === ChannelType.Category) {
            const children = channels.filter(
                (c) => c.parent?.id === channel.id,
            );
            // Sort children by position
            children.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            result.push(...children);
        }
    }

    // Remove duplicates (children already included)
    return Array.from(new Set(result));
}

export const ChannelList = observer(() => {
    const app = useAppStore();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const { openModal } = useModal();
    const inChannel = Boolean(app.channels.activeId);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const space = app.spaces.active;
    if (!space) return null;

    const visibleChannels = app.channels.getSpaceVisibleChannels(space.id);
    const activeChannel = app.channels.active;

    const flatChannels = flattenChannels(visibleChannels);

    const toggleCategory = (categoryId: string) => {
        app.channels.toggleCategoryCollapse(space.id, categoryId);
    };

    const showChannelMenu = (e: MouseEvent) => {
        contextMenu.show({
            event: e,
            id: `channel-list-context-menu-${space.id}`,
        });
    };

    const getCategoryWithChildren = (categoryId: string) => {
        const category = flatChannels.find((c) => c.id === categoryId);
        if (!category) return [];
        const children = flatChannels.filter(
            (c) => c.parent?.id === categoryId,
        );
        return [category, ...children];
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const oldIndex = flatChannels.findIndex((c) => c.id === active.id);
        const newIndex = flatChannels.findIndex((c) => c.id === over.id);

        runInAction(() => {
            const movingChannel = flatChannels[oldIndex];

            // If moving a category, move its children too
            let newOrder: Channel[] = [...flatChannels];
            if (movingChannel.type === ChannelType.Category) {
                const group = getCategoryWithChildren(movingChannel.id);
                newOrder = newOrder.filter((c) => !group.includes(c));

                let insertAt = newIndex;
                if (newIndex > oldIndex) insertAt = newIndex - group.length + 1;

                newOrder.splice(insertAt, 0, ...group);
            } else {
                // Move single channel
                newOrder = arrayMove(newOrder, oldIndex, newIndex);
            }

            // Recalculate parent/category for each channel
            let currentCategory: Channel | null = null;
            newOrder.forEach((channel) => {
                if (channel.type === ChannelType.Category) {
                    currentCategory = channel;
                    channel.parentId = null;
                    channel.setParent(null);
                } else {
                    channel.setParent(currentCategory);
                }
            });

            newOrder.forEach((channel, idx) => {
                channel.position = idx;
            });

            app.channels.setChannelOrder(space.id, newOrder);
        });
    };

    const activeChannelDrag = flatChannels.find((c) => c.id === activeId);
    const canMoveChannels = space.owner?.id === app.account?.id;

    const showSpaceMenu = (e: MouseEvent) => {
        if (!e.currentTarget) return;
        const isClick = e.type === "click";
        const rect = e.currentTarget.getBoundingClientRect();

        contextMenu.show({
            event: e,
            id: `space-context-menu-${space.id}-default`,
            ...(isClick && {
                position: {
                    x: Math.round(rect.left + rect.width / 2 - 70),
                    y: Math.round(rect.bottom + 5),
                },
            }),
        });
    };

    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        if (menuOpen) {
            contextMenu.hideAll();
        } else {
            showSpaceMenu(e);
        }
    };

    return (
        <>
            <Paper
                borderRight={inChannel ? "0 !important" : undefined}
                borderBottom="0 !important"
                borderTopLeftRadius="0.75rem"
                maxWidth="15rem"
                direction="column"
                width="100%"
                elevation={app.preferEmbossed ? 4 : 0}
            >
                <Paper
                    elevation={app.preferEmbossed ? 5 : 0}
                    borderLeft="0 !important"
                    borderRight="0 !important"
                    borderTop="0 !important"
                    width="100%"
                    maxHeight="2.95rem"
                    height="100%"
                    alignItems="center"
                    p={2}
                    justifyContent="space-between"
                    onContextMenu={showSpaceMenu}
                    onClick={handleClick}
                    css={{
                        cursor: "pointer",
                    }}
                >
                    <Typography level="body-sm">{space.name}</Typography>
                    <Stack
                        justifyContent="flex-end"
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        <ButtonGroup
                            spacing={2}
                            variant="plain"
                            size={12}
                            color="neutral"
                        >
                            <Tooltip
                                content={
                                    <TooltipWrapper>
                                        Invite to Space
                                    </TooltipWrapper>
                                }
                                placement="bottom"
                            >
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal(
                                            `invite-to-space-${space.id}`,
                                            <SpaceInviteToSpaceModal
                                                channel={activeChannel}
                                            />,
                                        );
                                    }}
                                    size={16}
                                >
                                    <FaUserPlus />
                                </IconButton>
                            </Tooltip>
                            <IconButton>
                                {menuOpen ? (
                                    <FaChevronDown
                                        style={{ transform: "rotate(180deg)" }}
                                    />
                                ) : (
                                    <FaChevronDown />
                                )}
                            </IconButton>
                        </ButtonGroup>
                    </Stack>
                </Paper>

                <Stack
                    onContextMenu={showChannelMenu}
                    flex={1}
                    height="100%"
                    direction="column"
                    pt="2rem"
                >
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={(e) => setActiveId(e.active.id as string)}
                        onDragEnd={handleDragEnd}
                        modifiers={[
                            restrictToWindowEdges,
                            restrictToParentElement,
                            restrictToVerticalAxis,
                        ]}
                    >
                        <SortableContext
                            items={flatChannels.map((c) => c.id)}
                            strategy={verticalListSortingStrategy}
                            disabled={!canMoveChannels}
                        >
                            {flatChannels.map((channel) => (
                                <SortableChannelListItem
                                    key={channel.id}
                                    channel={channel}
                                    isCategory={
                                        channel.type === ChannelType.Category
                                    }
                                    active={activeChannel?.id === channel.id}
                                    space={space}
                                    isCollapsed={app.channels.isCategoryCollapsed(
                                        space.id,
                                        channel.id,
                                    )}
                                    onToggleCollapse={
                                        channel.type === ChannelType.Category
                                            ? () => toggleCategory(channel.id)
                                            : undefined
                                    }
                                />
                            ))}
                        </SortableContext>
                        <Portal>
                            <DragOverlay>
                                {activeChannelDrag ? (
                                    <ChannelListItem
                                        channel={activeChannelDrag}
                                        isCategory={
                                            activeChannelDrag.type ===
                                            ChannelType.Category
                                        }
                                        active={false}
                                        space={space}
                                        isCollapsed={app.channels.isCategoryCollapsed(
                                            space.id,
                                            activeChannelDrag.id,
                                        )}
                                        css={{
                                            opacity: 0.8,
                                        }}
                                    />
                                ) : null}
                            </DragOverlay>
                        </Portal>
                    </DndContext>
                </Stack>
            </Paper>
            <Portal>
                <SpaceContextMenu space={space} setMenuOpen={setMenuOpen} />
                <ChannelListContextMenu space={space} />
            </Portal>
        </>
    );
});
