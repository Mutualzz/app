import { Paper } from "@components/Paper.tsx";
import { SidebarPill, type PillType } from "@components/SidebarPill";
import { SpaceIcon } from "@components/Space/SpaceIcon.tsx";
import { SpaceInviteModal } from "@components/Space/SpaceInviteModal.tsx";
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
import { contextMenu } from "@mutualzz/contexify";
import { formatColor } from "@mutualzz/ui-core";
import { IconButton, Portal, Stack, Tooltip, useTheme } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react";
import { useEffect, useState, type MouseEvent } from "react";
import { FaPlus } from "react-icons/fa";
import { SpaceContextMenu } from "./SpaceContextMenu";

const SortableSpace = observer(
    ({ space, onClick }: { space: Space; onClick: () => void }) => {
        const app = useAppStore();
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
            alignSelf: "center",
        };

        const showSpaceMenu = (e: MouseEvent) => {
            contextMenu.show({
                event: e,
                id: `space-context-menu-${space.id}-sidebar`,
            });
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
                                onContextMenu={showSpaceMenu}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                space={space}
                                onClick={onClick}
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
            maxWidth="5rem"
            direction="column"
            pt={3.75}
            spacing={2.5}
            width="100%"
            variant="plain"
            boxShadow="none"
            elevation={app.preferEmbossed ? 1 : 0}
        >
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
                        />
                    ))}
                </SortableContext>
            </DndContext>
            <Stack alignSelf="center">
                <Tooltip
                    title={<TooltipWrapper>Create a space</TooltipWrapper>}
                    placement="right"
                >
                    <IconButton
                        css={{
                            borderRadius: 9999,
                            padding: 12,
                            alignSelf: "center",
                        }}
                        color="success"
                        variant="outlined"
                        onClick={() =>
                            openModal("space-invite", <SpaceInviteModal />)
                        }
                    >
                        <FaPlus size={24} />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Paper>
    );
});
