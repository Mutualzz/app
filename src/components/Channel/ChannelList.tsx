import { Paper } from "@components/Paper.tsx";
import { SpaceContextMenu } from "@components/ContextMenus/SpaceContextMenu.tsx";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { TooltipWrapper } from "@components/TooltipWrapper.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    PointerSensor,
    useDroppable,
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
import { type MouseEvent, type ReactNode, useMemo, useState } from "react";
import { FaChevronDown, FaUserPlus } from "react-icons/fa";
import { ChannelListItem } from "./ChannelListItem.tsx";
import { ChannelListContextMenu } from "../ContextMenus/ChannelListContextMenu.tsx";
import { IconButton } from "@components/IconButton.tsx";
import { useMenu } from "@contexts/ContextMenu.context.tsx";

interface SortableChannelItemProps {
    channel: Channel;
    active: boolean;
    isCollapsed: boolean;
    space: Space;
    onToggleCollapse?: () => void;
    [key: string]: any;
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
            data: {
                containerId: props.containerId,
                type: channel.type,
                parentId: channel.parent?.id ?? null,
            },
        });

        const isCategory = useMemo(
            () => channel.type === ChannelType.Category,
            [channel.type],
        );

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
                    active={active}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={onToggleCollapse}
                    {...props}
                />
            </div>
        );
    },
);

function sortByPosition(a: Channel, b: Channel) {
    return (a.position ?? 0) - (b.position ?? 0);
}

function Container({ id, children }: { id: string; children: ReactNode }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <Stack spacing={2.5} direction="column" ref={setNodeRef}>
            {children}
        </Stack>
    );
}

interface DragData {
    containerId?: string;
    type?: number;
    parentId?: string | null;
}

// TODO: Fix a bug where you cant drag a channel outside its category
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

    const canManage = useMemo(
        () => app.spaces.active?.members.me?.hasPermission("ManageChannels"),
        [app.spaces.active?.members.me],
    );

    const space = app.spaces.active;
    if (!space) return null;

    const visibleChannels = space.visibleChannels;
    const activeChannel = app.channels.active;

    const rootChannels = visibleChannels
        .filter((c) => !c.parent)
        .slice()
        .sort(sortByPosition);

    const categories = rootChannels.filter(
        (c) => c.type === ChannelType.Category,
    );

    const childrenByCategory: Record<string, Channel[]> = {};
    for (const category of categories) {
        childrenByCategory[category.id] = visibleChannels
            .filter((c) => c.parent?.id === category.id)
            .slice()
            .sort(sortByPosition);
    }

    const toggleCategory = (categoryId: string) => {
        app.channels.toggleCategoryCollapse(space.id, categoryId);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        const activeData = active.data.current as DragData | undefined;
        const overData = over.data.current as DragData | undefined;

        const activeType = activeData?.type;
        const fromContainer = activeData?.containerId ?? "root";

        let toContainer = overData?.containerId ?? "root";

        // Dropping onto a container area (including empty categories)
        if (overIdStr.startsWith("container:"))
            toContainer = overIdStr.slice("container:".length);

        if (
            activeType !== ChannelType.Category &&
            overData?.type === ChannelType.Category
        )
            toContainer = `category:${overIdStr}`;

        // Categories should only live in the root container.
        if (activeType === ChannelType.Category) toContainer = "root";

        let rootOverId = overIdStr;
        if (
            activeType === ChannelType.Category &&
            overData?.containerId?.startsWith("category:")
        )
            rootOverId = overData.parentId ?? overIdStr;

        const rootIds = rootChannels.map((c) => c.id);
        const childIdsByCategory: Record<string, string[]> = {};
        for (const category of categories)
            childIdsByCategory[category.id] = (
                childrenByCategory[category.id] ?? []
            ).map((c) => c.id);

        const getIdsForContainer = (containerId: string): string[] => {
            if (containerId === "root") return [...rootIds];

            if (containerId.startsWith("category:")) {
                const catId = containerId.slice("category:".length);
                return [...(childIdsByCategory[catId] ?? [])];
            }

            return [];
        };

        const setIdsForContainer = (containerId: string, ids: string[]) => {
            if (containerId === "root") {
                app.channels.applyReorder(space.id, null, ids);
                return;
            }

            if (containerId.startsWith("category:")) {
                const catId = containerId.slice("category:".length);
                app.channels.applyReorder(space.id, catId, ids);
            }
        };

        runInAction(() => {
            const sourceIds = getIdsForContainer(fromContainer);
            const destIds = getIdsForContainer(toContainer);

            const isOverContainer = overIdStr.startsWith("container:");

            if (fromContainer === toContainer) {
                const currentIds =
                    fromContainer === "root" ? sourceIds : destIds;
                const oldIndex = currentIds.indexOf(activeIdStr);
                const newIndex =
                    fromContainer === "root"
                        ? currentIds.indexOf(rootOverId)
                        : currentIds.indexOf(overIdStr);
                if (oldIndex === -1 || newIndex === -1) return;

                const next = arrayMove(currentIds, oldIndex, newIndex);
                setIdsForContainer(fromContainer, next);
                return;
            }

            const fromIndex = sourceIds.indexOf(activeIdStr);
            if (fromIndex !== -1) sourceIds.splice(fromIndex, 1);

            let insertIndex = destIds.length;
            if (!isOverContainer) {
                if (overData?.type !== ChannelType.Category) {
                    const idx = destIds.indexOf(overIdStr);
                    if (idx !== -1) insertIndex = idx;
                }
            }
            destIds.splice(Math.max(0, insertIndex), 0, activeIdStr);

            setIdsForContainer(fromContainer, sourceIds);
            setIdsForContainer(toContainer, destIds);
        });
    };

    const allForOverlay = [
        ...rootChannels,
        ...Object.values(childrenByCategory).flat(),
    ];
    const activeChannelDrag = allForOverlay.find((c) => c.id === activeId);

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
                        <Container id="container:root">
                            <SortableContext
                                items={rootChannels.map((c) => c.id)}
                                strategy={verticalListSortingStrategy}
                                disabled={!canManage}
                            >
                                {rootChannels.map((channel) => {
                                    const isCategory =
                                        channel.type === ChannelType.Category;
                                    const collapsed = isCategory
                                        ? app.channels.isCategoryCollapsed(
                                              space.id,
                                              channel.id,
                                          )
                                        : false;

                                    const children = isCategory
                                        ? (childrenByCategory[channel.id] ?? [])
                                        : [];

                                    return (
                                        <div key={channel.id}>
                                            <SortableChannelItem
                                                channel={channel}
                                                isCategory={isCategory}
                                                active={
                                                    activeChannel?.id ===
                                                    channel.id
                                                }
                                                space={space}
                                                isCollapsed={collapsed}
                                                containerId="root"
                                                onToggleCollapse={
                                                    isCategory
                                                        ? () =>
                                                              toggleCategory(
                                                                  channel.id,
                                                              )
                                                        : undefined
                                                }
                                            />

                                            {isCategory && !collapsed ? (
                                                <>
                                                    <Container
                                                        id={`container:category:${channel.id}`}
                                                    >
                                                        <SortableContext
                                                            items={children.map(
                                                                (c) => c.id,
                                                            )}
                                                            strategy={
                                                                verticalListSortingStrategy
                                                            }
                                                            disabled={
                                                                !canManage
                                                            }
                                                        >
                                                            {children.length ===
                                                            0 ? (
                                                                <div
                                                                    style={{
                                                                        height: 4,
                                                                    }}
                                                                />
                                                            ) : null}

                                                            {children.map(
                                                                (child) => (
                                                                    <SortableChannelItem
                                                                        key={
                                                                            child.id
                                                                        }
                                                                        channel={
                                                                            child
                                                                        }
                                                                        isCategory={
                                                                            false
                                                                        }
                                                                        active={
                                                                            activeChannel?.id ===
                                                                            child.id
                                                                        }
                                                                        space={
                                                                            space
                                                                        }
                                                                        isCollapsed={
                                                                            false
                                                                        }
                                                                        containerId={`category:${channel.id}`}
                                                                    />
                                                                ),
                                                            )}
                                                        </SortableContext>
                                                    </Container>
                                                </>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </SortableContext>
                        </Container>

                        <Portal>
                            <DragOverlay>
                                {activeChannelDrag ? (
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
