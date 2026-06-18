import type { ReactNode } from "react";

export interface PermissionGroupDef<TFlag extends string = string> {
  title: string;
  items: {
    flag: TFlag;
    label: string;
    description?: ReactNode;
  }[];
}

export function permissionCategoryId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function filterPermissionGroups<T extends PermissionGroupDef>(
  groups: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.label.toLowerCase().includes(q)) return true;
        if (
          typeof item.description === "string" &&
          item.description.toLowerCase().includes(q)
        ) {
          return true;
        }
        return false;
      })
    }))
    .filter((group) => group.items.length > 0);
}

export function scrollToPermissionCategory(
  root: HTMLElement | null,
  categoryId: string
) {
  const el = root?.querySelector(
    `[data-permission-category="${categoryId}"]`
  );
  el?.scrollIntoView({ block: "start", behavior: "smooth" });
}
