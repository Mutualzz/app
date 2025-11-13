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
import {
    Avatar,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { useNavigate } from "@tanstack/react-router";
import { nameAcronym } from "@utils/index";
import { observer } from "mobx-react";
import { FaPlus } from "react-icons/fa";
import { SpacesAdd } from "./SpacesAdd";

const SortableSpace = observer(
    ({ space, onClick }: { space: Space; onClick: () => void }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: space.id });

        const style: CSSObject = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
            alignSelf: "center",
        };

        return (
            <div ref={setNodeRef} css={style} {...attributes} {...listeners}>
                <Tooltip title={`${space.name}`} placement="right">
                    <IconButton
                        css={{
                            borderRadius: 9999,
                            padding: 0,
                            cursor: isDragging ? "grabbing" : "grab",
                        }}
                        variant="plain"
                        size={48}
                        onClick={onClick}
                    >
                        <Avatar
                            size={48}
                            src={space.iconUrl ?? undefined}
                            variant={space.iconUrl ? "plain" : "outlined"}
                            color="primary"
                        >
                            <Typography level="body-sm">
                                {nameAcronym(space.name)}
                            </Typography>
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </div>
        );
    },
);

export const SpacesSidebar = observer(() => {
    const app = useAppStore();
    const navigate = useNavigate();
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
            elevation={2}
            maxWidth="5rem"
            direction="column"
            pt={15}
            spacing={10}
            width="100%"
            style={{
                boxShadow: "none",
            }}
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
                            onClick={() =>
                                navigate({ to: `/spaces/${space.id}` })
                            }
                            key={space.id}
                            space={space}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            <Stack alignSelf="center">
                <Tooltip title="Create a space" placement="right">
                    <IconButton
                        css={{
                            borderRadius: 9999,
                            padding: 12,
                            alignSelf: "center",
                        }}
                        color="success"
                        variant="outlined"
                        onClick={() =>
                            openModal("create-space", <SpacesAdd />, {
                                css: {
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                },
                            })
                        }
                    >
                        <FaPlus size={24} />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Paper>
    );
});
