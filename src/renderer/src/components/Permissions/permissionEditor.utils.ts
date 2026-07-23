import type { ReactNode } from "react";

export interface PermissionGroupDef<TFlag extends string = string> {
  id: string;
  title: string;
  items: {
    flag: TFlag;
    label: string;
    description?: ReactNode;
  }[];
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
