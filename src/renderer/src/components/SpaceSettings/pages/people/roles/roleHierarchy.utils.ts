import type { Space } from "@stores/objects/Space";
import type { Role } from "@stores/objects/Role";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "react-toastify";

export interface HierarchyContext {
  canManageRoles: boolean;
  actorIsOwner: boolean;
  actorIsAdmin: boolean;
  actorTopPos: number;
  canReorder: boolean;
}

export function getHierarchyContext(
  space: Space,
  me: SpaceMember | null | undefined
): HierarchyContext {
  const actorIsOwner = space.ownerId === me?.userId;
  const actorIsAdmin = me?.hasPermission("Administrator") ?? false;
  const actorTopPos = me?.highestRole?.position ?? -1;
  const canManageRoles = me?.hasPermission("ManageRoles") ?? false;

  return {
    canManageRoles,
    actorIsOwner,
    actorIsAdmin,
    actorTopPos,
    canReorder:
      canManageRoles && (actorIsOwner || actorIsAdmin || actorTopPos > 0)
  };
}

export function canAssignRole(
  hierarchyContext: HierarchyContext,
  role: Role
): boolean {
  if (hierarchyContext.actorIsOwner || hierarchyContext.actorIsAdmin) {
    return true;
  }

  return role.position < hierarchyContext.actorTopPos;
}

export function splitRolesByHierarchy(
  all: Role[],
  hierarchyContext: HierarchyContext
) {
  if (hierarchyContext.actorIsOwner || hierarchyContext.actorIsAdmin) {
    return { fixedRoles: [] as Role[], reorderableRoles: all };
  }

  return {
    fixedRoles: all.filter((r) => r.position >= hierarchyContext.actorTopPos),
    reorderableRoles: all.filter(
      (r) => r.position < hierarchyContext.actorTopPos
    )
  };
}

export function getPositionCeiling(fixedRoles: Role[], reorderableCount: number) {
  if (fixedRoles.length === 0) return reorderableCount;

  return Math.min(...fixedRoles.map((r) => r.position)) - 1;
}

export function filterRoles(roles: Role[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return roles;

  return roles.filter(
    (r) =>
      r.name.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query)
  );
}

export async function reorderRolesFromDrag(
  space: Space,
  reorderableRoles: Role[],
  activeId: string | number,
  overId: string | number,
  hierarchyContext: HierarchyContext,
  positionCeiling: number
) {
  const oldIndex = reorderableRoles.findIndex((r) => r.id === activeId);
  const newIndex = reorderableRoles.findIndex((r) => r.id === overId);
  if (oldIndex === -1 || newIndex === -1) return;

  const newOrder = arrayMove(reorderableRoles, oldIndex, newIndex);
  const movedPosition = positionCeiling - newIndex;

  if (
    !hierarchyContext.actorIsOwner &&
    !hierarchyContext.actorIsAdmin &&
    movedPosition >= hierarchyContext.actorTopPos
  ) {
    toast.error("Cannot move role above or equal to your highest role");
    return;
  }

  try {
    await space.roles.reorderRoles(newOrder, positionCeiling);
  } catch {
    toast.error("Failed to reorder roles");
  }
}
