import { LockIcon } from "@phosphor-icons/react";
import { Stack } from "@mutualzz/ui-web";
import { Tooltip } from "@components/Tooltip";
import { useTranslation } from "react-i18next";
import i18n from "@renderer/i18n";

export const getRoleHierarchyLockTooltip = () =>
  i18n.t("roles.hierarchy.cantReorder", { ns: "space" });

export const getRoleHierarchyAssignTooltip = () =>
  i18n.t("roles.hierarchy.cantAssign", { ns: "space" });

interface Props {
  size?: number;
  tooltip?: string;
}

export const RoleHierarchyLock = ({ size = 18, tooltip }: Props) => {
  const { t } = useTranslation("space");
  const content = tooltip ?? t("roles.hierarchy.cantReorder");

  return (
    <Tooltip content={content} placement="top">
      <Stack
        alignItems="center"
        justifyContent="center"
        css={{ opacity: 0.55, flexShrink: 0 }}
      >
        <LockIcon size={size} weight="fill" />
      </Stack>
    </Tooltip>
  );
};
