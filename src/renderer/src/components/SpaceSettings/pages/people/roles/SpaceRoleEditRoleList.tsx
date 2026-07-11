import { Button } from "@components/Button";
import { useMenu } from "@contexts/ContextMenu.context";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import { styled } from "@mutualzz/ui-core";
import { ButtonGroup, Stack, Typography } from "@mutualzz/ui-web";
import type { Role } from "@stores/objects/Role";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  getHierarchyContext,
  getPositionCeiling,
  reorderRolesFromDrag,
  splitRolesByHierarchy
} from "./roleHierarchy.utils";
import { RoleHierarchyLock } from "./RoleHierarchyLock";

const RoleColorBlob = styled("span")<{ color: string }>(({ color }) => ({
  width: 12,
  height: 12,
  backgroundColor: color,
  borderRadius: "50%",
  flexShrink: 0
}));

interface RoleSidebarButtonProps {
  role: Role;
  currentRoleId: string;
  space: Space;
  onSelect: (role: Role) => void;
  onDelete?: () => void;
  dragHandle?: ReactNode;
}

const RoleSidebarButton = observer(
  ({
    role,
    currentRoleId,
    space,
    onSelect,
    onDelete,
    dragHandle
  }: RoleSidebarButtonProps) => {
    const { openContextMenu } = useMenu();

    return (
      <Button
        variant={role.id === currentRoleId ? "soft" : "plain"}
        disabled={role.id === currentRoleId}
        onClick={() => onSelect(role)}
        startDecorator={
          <Stack direction="row" alignItems="center" spacing={1}>
            {dragHandle}
            <RoleColorBlob color={role.color} />
          </Stack>
        }
        onContextMenu={(e) =>
          openContextMenu(e, {
            type: "role",
            space,
            role,
            onDelete
          })
        }
      >
        {role.name}
      </Button>
    );
  }
);

interface SortableRoleSidebarButtonProps extends Omit<
  RoleSidebarButtonProps,
  "dragHandle"
> {
  disabled: boolean;
}

const SortableRoleSidebarButton = observer(
  ({ disabled, ...props }: SortableRoleSidebarButtonProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({
      id: props.role.id,
      disabled
    });

    const dragHandle = disabled ? undefined : (
      <Stack
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        alignItems="center"
        justifyContent="center"
        css={{
          cursor: "grab",
          opacity: 0.55,
          touchAction: "none",
          "&:hover": { opacity: 1 }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DotsSixVerticalIcon size={12} weight="bold" />
      </Stack>
    );

    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 999 : undefined
        }}
      >
        <RoleSidebarButton {...props} dragHandle={dragHandle} />
      </div>
    );
  }
);

interface Props {
  space: Space;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  onRoleDeleted?: () => void;
}

export const SpaceRoleEditRoleList = observer(
  ({ space, currentRole, setCurrentRole, onRoleDeleted }: Props) => {
    const { t } = useTranslation("space");
    const [isReordering, setIsReordering] = useState(false);

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const customRoles = space.roles.byHierarchy;
    const everyoneRole = space.roles.get(space.id);
    const me = space.members.me;
    const hierarchyContext = getHierarchyContext(space, me);
    const { fixedRoles, reorderableRoles } = splitRolesByHierarchy(
      customRoles,
      hierarchyContext
    );
    const canDragRoles = hierarchyContext.canReorder && !isReordering;
    const positionCeiling = getPositionCeiling(
      fixedRoles,
      reorderableRoles.length
    );

    const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setIsReordering(true);
      try {
        await reorderRolesFromDrag(
          space,
          reorderableRoles,
          active.id,
          over.id,
          hierarchyContext,
          positionCeiling
        );
      } finally {
        setIsReordering(false);
      }
    };

    const renderRoleButton = (
      role: Role,
      sortable: boolean,
      locked = false
    ) => {
      const dragHandle =
        locked && canDragRoles ? <RoleHierarchyLock size={12} /> : undefined;

      const props = {
        role,
        currentRoleId: currentRole.id,
        space,
        onSelect: setCurrentRole,
        onDelete: currentRole.id === role.id ? onRoleDeleted : undefined,
        dragHandle
      };

      if (sortable) {
        return (
          <SortableRoleSidebarButton
            key={`space-role-${role.id}`}
            {...props}
            disabled={!canDragRoles}
          />
        );
      }

      return <RoleSidebarButton key={`space-role-${role.id}`} {...props} />;
    };

    return (
      <Stack direction="column" spacing={1.25}>
        {canDragRoles && reorderableRoles.length > 0 && (
          <Typography level="body-xs" textColor="muted" px={0.5}>
            {t("roles.hierarchy.dragToReorderHierarchy")}
          </Typography>
        )}

        <ButtonGroup
          color="neutral"
          spacing={2.5}
          orientation="vertical"
          horizontalAlign="left"
        >
          {fixedRoles.map((role) => renderRoleButton(role, false, true))}

          {canDragRoles && reorderableRoles.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={reorderableRoles.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {reorderableRoles.map((role) => renderRoleButton(role, true))}
              </SortableContext>
            </DndContext>
          ) : (
            reorderableRoles.map((role) => renderRoleButton(role, false))
          )}

          {everyoneRole && renderRoleButton(everyoneRole, false, true)}
        </ButtonGroup>
      </Stack>
    );
  }
);
