import { Paper } from "@components/Paper.tsx";
import { SpaceContextMenu } from "@components/ContextMenus/SpaceContextMenu.tsx";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { TooltipWrapper } from "@components/TooltipWrapper.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import { useMenu } from "@contexts/ContextMenu.context.tsx";
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
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
import { useAppStore } from "@hooks/useStores.ts";
import { contextMenu } from "@mutualzz/contexify";
import { ChannelType } from "@mutualzz/types";
import {
    ButtonGroup,
    Portal,
    Stack,
    Tooltip,
    Typography,
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel.ts";
import type { Space } from "@stores/objects/Space.ts";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { type MouseEvent, useState } from "react";
import { FaChevronDown, FaUserPlus } from "react-icons/fa";
import { ChannelListItem } from "./ChannelListItem.tsx";
import { ChannelListContextMenu } from "../ContextMenus/ChannelListContextMenu.tsx";
import { IconButton } from "@components/IconButton.tsx";

interface SortableChannelItemProps {
    channel: Channel;
    active: boolean;
    isCollapsed: boolean;
    space: Space;
    onToggleCollapse?: () => void;
}

const SortableChannelItem = observer(
    ({
        channel,
        active,
        isCollapsed,
        space,
        onToggleCollapse,
        ...props
    }: SortableChannelItemProps) => {
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
                    marginTop:
                        channel.type === ChannelType.Category
                            ? "1rem"
                            : "0.5rem",
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
                    {...props}
                />
            </div>
        );
    },
);

function flattenChannels(
    allChannels: Channel[],
    collapsedCategories: Set<string>,
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
    categoryId: string,
): Channel[] {
    const category = allChannels.find((c) => c.id === categoryId);
    if (!category) return [];

    const children = allChannels.filter((c) => c.parentId === categoryId);
    return [category, ...children];
}

export const ChannelList = observer(() => {
    const app = useAppStore();
    const { openContextMenu } = useMenu();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const { openModal } = useModal();
    const inChannel = Boolean(app.channels.activeId);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const space = app.spaces.active;
    if (!space) return null;

    const visibleChannels = space.visibleChannels;
    const activeChannel = app.channels.active;

    const collapsedCategories = new Set<string>();
    visibleChannels
        .filter((c) => c.type === ChannelType.Category)
        .forEach((c) => {
            if (app.channels.isCategoryCollapsed(space.id, c.id)) {
                collapsedCategories.add(c.id);
            }
        });

    const flatChannels = flattenChannels(visibleChannels, collapsedCategories);

    const toggleCategory = (categoryId: string) => {
        app.channels.toggleCategoryCollapse(space.id, categoryId);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const oldIndex = flatChannels.findIndex((c) => c.id === active.id);
        const newIndex = flatChannels.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        runInAction(() => {
            const movingChannel = flatChannels[oldIndex];

            let newOrder: Channel[];

            if (movingChannel.type === ChannelType.Category) {
                const group = getAllCategoryChildren(
                    visibleChannels,
                    movingChannel.id,
                );

                newOrder = flatChannels.filter((c) => !group.includes(c));

                let insertAt = newIndex;
                if (newIndex > oldIndex) {
                    const visibleGroupSize = group.filter((c) =>
                        flatChannels.includes(c),
                    ).length;
                    insertAt = newIndex - visibleGroupSize + 1;
                }

                const visibleGroup = group.filter((c) =>
                    flatChannels.includes(c),
                );
                newOrder.splice(insertAt, 0, ...visibleGroup);
            } else {
                newOrder = arrayMove(flatChannels, oldIndex, newIndex);
            }

            const completeOrder: Channel[] = [];
            let currentCategory: Channel | null = null;

            for (const channel of newOrder) {
                if (channel.type === ChannelType.Category) {
                    currentCategory = channel;
                    completeOrder.push(channel);

                    const allChildren = visibleChannels
                        .filter((c) => c.parentId === channel.id)
                        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
                    completeOrder.push(...allChildren);
                } else {
                    completeOrder.push(channel);
                }
            }

            currentCategory = null;
            completeOrder.forEach((channel, idx) => {
                if (channel.type === ChannelType.Category) {
                    currentCategory = channel;
                    channel.parentId = null;
                } else {
                    channel.parentId = currentCategory?.id ?? null;
                }
                channel.position = idx;
            });

            app.channels.setChannelOrder(space.id, completeOrder);
        });
    };

    const activeChannelDrag = flatChannels.find((c) => c.id === activeId);
    const canMoveChannels =
        app.spaces.active?.members.me?.hasPermission("ManageChannels");

    const showSpaceMenu = (e: MouseEvent) => {
        if (!e.currentTarget) return;
        const isClick = e.type === "click";
        const rect = e.currentTarget.getBoundingClientRect();

        if (isClick) {
            openContextMenu(
                e,
                { type: "space", space },
                {
                    x: Math.round(rect.left + rect.width / 2 - 70),
                    y: Math.round(rect.bottom + 5),
                },
            );
            return;
        }

        openContextMenu(e, { type: "space", space });
    };

    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        if (menuOpen) contextMenu.hideAll();
        else showSpaceMenu(e);
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
                elevation={app.settings?.preferEmbossed ? 4 : 0}
            >
                <Paper
                    elevation={app.settings?.preferEmbossed ? 5 : 0}
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
                        <ButtonGroup spacing={2} variant="plain" size={12}>
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
                    onContextMenu={(e) =>
                        openContextMenu(e, {
                            type: "channelList",
                            space,
                        })
                    }
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
                                <SortableChannelItem
                                    key={channel.id}
                                    channel={channel}
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
                                {activeChannelDrag && (
                                    <ChannelListItem
                                        channel={activeChannelDrag}
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
                                )}
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
