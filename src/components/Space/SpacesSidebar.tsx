import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { Paper } from "@components/Paper";
import { SidebarPill, type PillType } from "@components/SidebarPill";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { SpaceInviteModal } from "@components/Space/SpaceInviteModal";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useModal } from "@contexts/Modal.context";
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSObject } from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import { formatColor } from "@mutualzz/ui-core";
import { IconButton, Portal, Stack, Tooltip, useTheme } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { useNavigate } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { SpaceContextMenu } from "../ContextMenus/SpaceContextMenu.tsx";
import { useMenu } from "@contexts/ContextMenu.context.tsx";

const SortableSpace = observer(
    ({
        space,
        onClick,
        selected,
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
            isDragging,
        } = useSortable({ id: space.id });
        const { theme } = useTheme();

        const [pillType, setPillType] = useState<PillType>("none");
        const [isHovered, setIsHovered] = useState(false);

        useEffect(() => {
            if (app.spaces.activeId === space.id) return setPillType("active");
            else if (isHovered) return setPillType("hover");
            // TODO: unread
            else return setPillType("none");
        }, [app.spaces.activeId, isHovered]);

        const style: CSSObject = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };

        return (
            <>
                <div
                    ref={setNodeRef}
                    css={style}
                    {...attributes}
                    {...listeners}
                >
                    <Tooltip
                        title={
                            <TooltipWrapper
                                paperProps={{
                                    borderRadius: 5,
                                    variant: "elevation",
                                    elevation: 3,
                                    boxShadow: "unset",
                                    css: {
                                        border: `1px solid ${formatColor(
                                            theme.colors.neutral,
                                            {
                                                alpha: 30,
                                                format: "hexa",
                                            },
                                        )}`,
                                    },
                                }}
                                typographyProps={{ level: "body-sm" }}
                            >
                                {space.name}
                            </TooltipWrapper>
                        }
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
                                        fromSidebar: true,
                                    })
                                }
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                space={space}
                                onClick={onClick}
                                selected={selected}
                                css={{
                                    cursor: isDragging ? "grabbing" : "pointer",
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
    },
);

export const SpacesSidebar = observer(() => {
    const navigate = useNavigate();
    const app = useAppStore();
    const { openModal } = useModal();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = app.spaces.positioned.findIndex(
            (s) => s.id === active.id,
        );
        const newIndex = app.spaces.positioned.findIndex(
            (s) => s.id === over.id,
        );

        if (oldIndex !== -1 && newIndex !== -1) {
            app.settings?.moveSpace(oldIndex, newIndex);
        }
    };

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
                    title={
                        <TooltipWrapper>
                            Switch to{" "}
                            {capitalize(
                                app.mode
                                    ? "Direct Messages"
                                    : (app.settings?.preferredMode ?? "Spaces"),
                            )}
                        </TooltipWrapper>
                    }
                    placement="right"
                >
                    <AnimatedLogo
                        css={{
                            width: 48,
                            cursor: "pointer",
                            marginBottom: 5,
                        }}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => {
                            navigate({
                                to: app.mode
                                    ? "/@me"
                                    : `/${app.settings?.preferredMode ?? "spaces"}`,
                                replace: true,
                            });
                        }}
                    />
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
                            }}
                            key={space.id}
                            space={space}
                            selected={app.spaces.activeId === space.id}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            <Stack>
                <Tooltip
                    title={<TooltipWrapper>Create a space</TooltipWrapper>}
                    placement="right"
                >
                    <IconButton
                        size={36}
                        css={{
                            borderRadius: 9999,
                        }}
                        color="success"
                        variant="outlined"
                        onClick={() =>
                            openModal("space-invite", <SpaceInviteModal />)
                        }
                    >
                        <FaPlus
                            css={{
                                padding: 6,
                            }}
                        />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Paper>
    );
});
