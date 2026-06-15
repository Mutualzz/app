import type { Space } from "@stores/objects/Space";
import { useEffect, useState, type ReactNode } from "react";
import { Divider, Input, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { Button } from "@components/Button";
import { useMutation } from "@tanstack/react-query";
import type { APIRole } from "@mutualzz/types";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import type { Role } from "@stores/objects/Role";
import { SpaceRoleEdit } from "./SpaceRoleEdit";
import type { Theme } from "@emotion/react";
import { AnimatedStack } from "@components/Animated/AnimatedStack";
import { dynamicElevation, formatColor } from "@mutualzz/ui-core";
import { IconButton } from "@components/IconButton";
import { useMenu } from "@contexts/ContextMenu.context";
import { useModal } from "@contexts/Modal.context";
import { RoleActionConfirm } from "@components/Modals/RoleActionConfirm";
import {
  ArrowRightIcon,
  DotsSixVerticalIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  ShieldIcon,
  TrashIcon,
  UserIcon,
  UsersFourIcon
} from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
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
import {
  filterRoles,
  getHierarchyContext,
  getPositionCeiling,
  reorderRolesFromDrag,
  splitRolesByHierarchy
} from "./roleHierarchy.utils";
import { RoleHierarchyLock } from "./RoleHierarchyLock";

const ROLE_DRAG_WIDTH = "1.75rem";
const ROLE_MEMBERS_WIDTH = "8rem";
const ROLE_ACTIONS_WIDTH = "6.5rem";

interface RoleListColumnsProps {
  isHeader?: boolean;
  reserveDragColumn?: boolean;
  dragHandle?: ReactNode;
  locked?: boolean;
  name: ReactNode;
  members: ReactNode;
  actions: ReactNode;
}

const RoleListColumns = ({
  isHeader = false,
  reserveDragColumn = false,
  dragHandle,
  locked = false,
  name,
  members,
  actions
}: RoleListColumnsProps) => (
  <Stack direction="row" alignItems="center" width="100%" spacing={5}>
    {isHeader ? (
      <Stack
        flex={1}
        minWidth={0}
        direction="row"
        alignItems="center"
        spacing={2.5}
      >
        {name}
      </Stack>
    ) : (
      <>
        {reserveDragColumn && (
          <Stack
            width={ROLE_DRAG_WIDTH}
            flexShrink={0}
            alignItems="center"
            justifyContent="center"
          >
            {dragHandle ?? (locked ? <RoleHierarchyLock /> : null)}
          </Stack>
        )}
        <Stack flex={1} minWidth={0} direction="row" alignItems="center">
          {name}
        </Stack>
      </>
    )}
    <Stack
      width={ROLE_MEMBERS_WIDTH}
      flexShrink={0}
      direction="row"
      alignItems="center"
      spacing={1.25}
    >
      {members}
    </Stack>
    <Stack
      width={ROLE_ACTIONS_WIDTH}
      flexShrink={0}
      direction="row"
      spacing={2}
      justifyContent="flex-end"
    >
      {actions}
    </Stack>
  </Stack>
);

interface Props {
  space: Space;
}

interface RoleItemProps {
  theme: Theme;
  role: Role;
  membersWithRole: number;
  last: boolean;
  space: Space;
  onClick: () => void;
  dragHandle?: ReactNode;
  reserveDragColumn?: boolean;
  locked?: boolean;
}

const RoleItem = observer(
  ({
    theme,
    role,
    last,
    space,
    onClick,
    membersWithRole,
    dragHandle,
    reserveDragColumn = false,
    locked = false
  }: RoleItemProps) => {
    const { openModal } = useModal();
    const { openContextMenu } = useMenu();

    return (
      <>
        <AnimatedStack
          flex={1}
          direction="row"
          alignItems="center"
          spacing={2}
          p={2.5}
          whileHover={{
            background: formatColor(dynamicElevation(theme.colors.surface, 5), {
              alpha: 50
            })
          }}
          onClick={onClick}
          css={{
            cursor: "pointer"
          }}
          onContextMenu={(e) =>
            openContextMenu(e, {
              type: "role",
              space,
              role
            })
          }
        >
          <RoleListColumns
            reserveDragColumn={reserveDragColumn}
            dragHandle={dragHandle}
            locked={locked}
            name={
              <Stack
                direction="row"
                spacing={2.5}
                alignItems="center"
                css={{ minWidth: 0, width: "100%" }}
              >
                <ShieldIcon weight="fill" size={16} color={role.color} />
                <Typography
                  fontWeight="bold"
                  title={role.name}
                  css={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {role.name}
                </Typography>
              </Stack>
            }
            members={
              <>
                {membersWithRole} <UserIcon />
              </>
            }
            actions={
              <>
                <Tooltip content="Edit" placement="top">
                  <IconButton
                    variant="soft"
                    onClick={onClick}
                    padding={8}
                    size="sm"
                  >
                    <PencilIcon weight="fill" />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Delete" placement="top">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(
                        "delete-role",
                        <RoleActionConfirm role={role} />
                      );
                    }}
                    color="danger"
                    padding={8}
                    variant="soft"
                    size="sm"
                  >
                    <TrashIcon weight="fill" />
                  </IconButton>
                </Tooltip>
              </>
            }
          />
        </AnimatedStack>
        {!last && (
          <Divider
            lineColor="muted"
            css={{
              opacity: 0.25
            }}
          />
        )}
      </>
    );
  }
);

interface SortableRoleItemProps {
  theme: Theme;
  role: Role;
  membersWithRole: number;
  last: boolean;
  space: Space;
  onClick: () => void;
  disabled: boolean;
  reserveDragColumn?: boolean;
  locked?: boolean;
}

const SortableRoleItem = observer(
  ({
    theme,
    role,
    last,
    space,
    onClick,
    membersWithRole,
    disabled,
    reserveDragColumn = false,
    locked = false
  }: SortableRoleItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({
      id: role.id,
      disabled
    });

    const dragHandle = (
      <Tooltip content="Drag to reorder" placement="top">
        <Stack
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          alignItems="center"
          justifyContent="center"
          css={{
            cursor: disabled ? "default" : "grab",
            opacity: disabled ? 0.35 : 0.6,
            touchAction: "none",
            "&:hover": disabled ? undefined : { opacity: 1 }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DotsSixVerticalIcon size={18} weight="bold" />
        </Stack>
      </Tooltip>
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
        <RoleItem
          theme={theme}
          role={role}
          last={last}
          space={space}
          onClick={onClick}
          membersWithRole={membersWithRole}
          dragHandle={disabled ? undefined : dragHandle}
          reserveDragColumn={reserveDragColumn}
          locked={locked}
        />
      </div>
    );
  }
);

export const SpaceRolesSettings = observer(({ space }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const { mutate: fetchRoles } = useMutation({
    mutationKey: ["fetch-roles", space.id],
    mutationFn: async () => app.rest.get<APIRole>(`/spaces/${space.id}/roles`)
  });

  const { mutate: createRole, isPending: creatingRole } = useMutation({
    mutationKey: ["create-role", space.id],
    mutationFn: async () => space.roles.create(),
    onSuccess: (data) => {
      const newRole = space.roles.add(data);
      setCurrentRole(newRole);
    }
  });

  useEffect(() => {
    if (space.roles.all.length === 0) fetchRoles();
  }, [space.roles.all.length]);

  const everyoneRole = space.roles.get(space.id);
  const me = space.members.me;

  const hierarchyContext = getHierarchyContext(space, me);
  const { fixedRoles, reorderableRoles } = splitRolesByHierarchy(
    space.roles.byHierarchy,
    hierarchyContext
  );

  const isSearching = search.trim() !== "";
  const visibleFixedRoles = filterRoles(fixedRoles, search);
  const visibleReorderableRoles = filterRoles(reorderableRoles, search);
  const visibleRoles = [...visibleFixedRoles, ...visibleReorderableRoles];
  const canDragRoles =
    hierarchyContext.canReorder && !isSearching && !isReordering;

  const positionCeiling = getPositionCeiling(
    fixedRoles,
    reorderableRoles.length
  );

  const calculateMembersWithRole = (roleId: string) => {
    return space.members.all.filter((m) => m.roles.has(roleId)).length;
  };

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

  if (currentRole)
    return (
      <SpaceRoleEdit
        key={currentRole.id}
        membersWithRole={calculateMembersWithRole(currentRole.id)}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        space={space}
      />
    );

  const renderRoleItem = (
    role: Role,
    last: boolean,
    sortable: boolean,
    locked = false
  ) => {
    const props = {
      theme,
      role,
      last,
      space,
      membersWithRole: calculateMembersWithRole(role.id),
      onClick: () => setCurrentRole(role),
      reserveDragColumn: canDragRoles,
      locked: locked && canDragRoles
    };

    if (sortable) {
      return (
        <SortableRoleItem
          key={`role-${role.id}`}
          {...props}
          disabled={!canDragRoles}
        />
      );
    }

    return <RoleItem key={`role-${role.id}`} {...props} />;
  };

  return (
    <Stack px={3} direction="column" pt={2.5} spacing={10}>
      {everyoneRole && (
        <Stack mx={20} direction="column" gap={0.5}>
          <Button
            onClick={() => setCurrentRole(everyoneRole)}
            variant="soft"
            horizontalAlign="left"
            size={20}
          >
            <Stack flex={1} direction="row" spacing={2}>
              <UsersFourIcon weight="fill" />
              <Stack direction="column" alignItems="flex-start">
                <Typography level="body-sm" fontWeight="bold">
                  Default Permissions
                </Typography>
                <Typography level={"body-xs"}>
                  @everyone - applies to all space members
                </Typography>
              </Stack>
              <ArrowRightIcon
                css={{
                  marginLeft: "auto"
                }}
                size={16}
              />
            </Stack>
          </Button>
        </Stack>
      )}
      <Stack alignItems="center" spacing={2} flex={1}>
        <Input
          startDecorator={<MagnifyingGlassIcon />}
          placeholder="Search Roles"
          fullWidth
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          color="primary"
          disabled={creatingRole}
          onClick={() => createRole()}
        >
          Create Role
        </Button>
      </Stack>
      <Stack direction="column">
        {visibleRoles.length > 0 && (
          <Stack direction="column" spacing={2} px={2.5}>
            <RoleListColumns
              isHeader
              reserveDragColumn={canDragRoles}
              name={<Typography>Roles - {visibleRoles.length}</Typography>}
              members={<Typography>Members</Typography>}
              actions={<Typography>Actions</Typography>}
            />
            {canDragRoles && (
              <Typography level="body-xs" color="muted">
                Roles higher in the list have more authority. Drag roles to
                change their hierarchy.
              </Typography>
            )}
            <Divider
              lineColor="muted"
              css={{
                opacity: 0.25
              }}
            />
          </Stack>
        )}

        {visibleRoles.length === 0 && (
          <Stack justifyContent="center" alignItems="center" py="4rem">
            <Typography textAlign="center" color="muted">
              {isSearching
                ? "No roles match your search."
                : "No roles have been created for this space yet."}
            </Typography>
          </Stack>
        )}

        <Stack direction="column" justifyContent="center">
          {visibleFixedRoles.map((role, i) =>
            renderRoleItem(
              role,
              visibleReorderableRoles.length === 0 &&
                i === visibleFixedRoles.length - 1,
              false,
              true
            )
          )}

          {canDragRoles && visibleReorderableRoles.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleReorderableRoles.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {visibleReorderableRoles.map((role, i) =>
                  renderRoleItem(
                    role,
                    i === visibleReorderableRoles.length - 1,
                    true
                  )
                )}
              </SortableContext>
            </DndContext>
          ) : (
            visibleReorderableRoles.map((role, i) =>
              renderRoleItem(
                role,
                i === visibleReorderableRoles.length - 1,
                false
              )
            )
          )}
        </Stack>
      </Stack>
    </Stack>
  );
});
