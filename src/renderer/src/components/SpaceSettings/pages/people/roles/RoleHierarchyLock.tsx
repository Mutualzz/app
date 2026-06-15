import { LockIcon } from "@phosphor-icons/react";
import { Stack } from "@mutualzz/ui-web";
import { Tooltip } from "@components/Tooltip";

export const ROLE_HIERARCHY_LOCK_TOOLTIP =
  "You can't reorder roles at or above your highest role";

export const ROLE_HIERARCHY_ASSIGN_TOOLTIP =
  "You can't assign or remove this role";

interface Props {
  size?: number;
  tooltip?: string;
}

export const RoleHierarchyLock = ({
  size = 18,
  tooltip = ROLE_HIERARCHY_LOCK_TOOLTIP
}: Props) => (
  <Tooltip content={tooltip} placement="top">
    <Stack
      alignItems="center"
      justifyContent="center"
      css={{ opacity: 0.55, flexShrink: 0 }}
    >
      <LockIcon size={size} weight="fill" />
    </Stack>
  </Tooltip>
);
