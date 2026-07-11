import type { APIRole } from "@mutualzz/types";
import {
  Button,
  Divider,
  Stack,
  Switch,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import {
  BitField,
  type PermissionFlag,
  type PermissionFlags,
  permissionFlags
} from "@mutualzz/bitfield";
import { spacePermissionGroups } from "@mutualzz/i18n";
import { type ReactNode, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { PermissionEditorControls } from "@components/Permissions/PermissionEditorControls";
import {
  filterPermissionGroups,
  scrollToPermissionCategory,
  type PermissionGroupDef
} from "@components/Permissions/permissionEditor.utils";

interface Props {
  changes: Partial<Omit<APIRole, "id">>;
  setChanges: (
    next:
      | Partial<Omit<APIRole, "id">>
      | ((prev: Partial<Omit<APIRole, "id">>) => Partial<Omit<APIRole, "id">>)
  ) => void;
}

const PermissionItem = ({
  flag,
  label,
  description,
  hasPermission,
  togglePermission
}: {
  flag: PermissionFlag;
  label: ReactNode;
  description?: ReactNode;
  hasPermission: boolean;
  togglePermission: (flag: PermissionFlag) => void;
}) => {
  const { theme } = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      mr={5}
      flex={1}
      p={1.25}
      borderRadius={6}
      css={{
        cursor: "pointer",
        ":hover": {
          background: `${theme.colors.info}22`
        }
      }}
      onClick={() => togglePermission(flag)}
    >
      <Stack direction="column" spacing={0.5}>
        <Typography>{label}</Typography>
        {description && (
          <Typography level="body-sm" textColor="muted">
            {description}
          </Typography>
        )}
      </Stack>
      <Switch
        checked={hasPermission}
        color="primary"
        shape="circle"
        onChange={() => togglePermission(flag)}
      />
    </Stack>
  );
};

export const SpaceRoleEditPermissions = observer(
  ({ changes, setChanges }: Props) => {
    const { t } = useTranslation("space");
    const rootRef = useRef<HTMLDivElement>(null);
    const [search, setSearch] = useState("");

    const permissions: BitField<PermissionFlags> = changes.allow
      ? BitField.fromString(permissionFlags, changes.allow.toString())
      : BitField.fromString(permissionFlags, "0");

    const groups = useMemo((): PermissionGroupDef<PermissionFlag>[] => {
      return spacePermissionGroups.map((group) => ({
        id: group.id,
        title: t(group.titleKey),
        items: group.items.map((item) => {
          const flag = item.flag as PermissionFlag;
          if (flag === "Administrator") {
            return {
              flag,
              label: t(item.labelKey),
              description: (
                <>
                  {t("roles.permissions.flags.Administrator.descriptionBefore")}{" "}
                  <Typography color="danger" variant="plain" fontWeight="bold">
                    {t("roles.permissions.flags.Administrator.descriptionDanger")}
                  </Typography>
                  .
                </>
              )
            };
          }
          return {
            flag,
            label: t(item.labelKey),
            description: t(item.descriptionKey)
          };
        })
      }));
    }, [t]);

    const categories = groups.map((group) => ({
      id: group.id,
      title: group.title
    }));

    const visibleGroups = filterPermissionGroups(groups, search);

    const togglePermission = (flag: PermissionFlag) => {
      const newPermissions = permissions.has(flag)
        ? permissions.remove(flag)
        : permissions.add(flag);

      setChanges((prev) => ({
        ...prev,
        allow: newPermissions.bits
      }));
    };

    const clearPermissions = () => {
      setChanges((prev) => ({
        ...prev,
        allow: 0n
      }));
    };

    const handleCategoryJump = (categoryId: string) => {
      setSearch("");
      setTimeout(() => {
        scrollToPermissionCategory(rootRef.current, categoryId);
      }, 0);
    };

    return (
      <Stack
        ref={rootRef}
        direction="column"
        justifyContent="center"
        pb={10}
        spacing={3}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2.5}
          mr={5}
        >
          <PermissionEditorControls
            search={search}
            onSearchChange={setSearch}
            categories={categories}
            onCategoryJump={handleCategoryJump}
          />
          <Button
            color="danger"
            onClick={() => clearPermissions()}
            size="sm"
            variant="soft"
            disabled={permissions.toArray().length === 0}
            css={{ flexShrink: 0, marginTop: 2 }}
          >
            {t("roles.permissions.clear")}
          </Button>
        </Stack>

        {visibleGroups.length === 0 ? (
          <Typography textColor="muted" textAlign="center" py={4}>
            {t("roles.permissions.emptySearch")}
          </Typography>
        ) : (
          visibleGroups.map((group, groupIndex) => (
            <Stack
              key={group.id}
              direction="column"
              spacing={2.5}
              data-permission-category={group.id}
            >
              <Stack alignItems="center">
                <Typography level="body-lg">{group.title}</Typography>
              </Stack>
              <Stack direction="column" spacing={2.5}>
                {group.items.map((item, itemIndex) => (
                  <Stack key={item.flag} direction="column" spacing={2.5}>
                    <PermissionItem
                      flag={item.flag}
                      label={item.label}
                      description={item.description}
                      hasPermission={permissions.has(item.flag)}
                      togglePermission={togglePermission}
                    />
                    {itemIndex < group.items.length - 1 && (
                      <Divider css={{ opacity: 0.5 }} />
                    )}
                  </Stack>
                ))}
              </Stack>
              {groupIndex < visibleGroups.length - 1 && (
                <Divider css={{ opacity: 0.35 }} />
              )}
            </Stack>
          ))
        )}
      </Stack>
    );
  }
);
