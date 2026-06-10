import type { Space } from "@stores/objects/Space";
import { useEffect, useState } from "react";
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
  MagnifyingGlassIcon,
  PencilIcon,
  ShieldIcon,
  TrashIcon,
  UserIcon,
  UsersFourIcon
} from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";

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
}

const RoleItem = observer(
  ({ theme, role, last, space, onClick, membersWithRole }: RoleItemProps) => {
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
          <Stack width="100%" direction="row" alignItems="center">
            <Stack direction="row" spacing={2.5} alignItems="center">
              <ShieldIcon weight="fill" size={16} color={role.color} />
              <Typography fontWeight="bold">{role.name}</Typography>
            </Stack>
            <Typography
              display="flex"
              spacing={1.25}
              alignItems="center"
              mx="auto"
            >
              {membersWithRole} <UserIcon />
            </Typography>
            <Stack spacing={2} ml="auto">
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
                    openModal("delete-role", <RoleActionConfirm role={role} />);
                  }}
                  color="danger"
                  padding={8}
                  variant="soft"
                  size="sm"
                >
                  <TrashIcon weight="fill" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
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

export const SpaceRolesSettings = observer(({ space }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

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

  const roles = space.roles.assignable;
  const everyoneRole = space.roles.get(space.id);

  const otherRoles = roles
    .filter((r) => r.id !== space.id)
    .filter((r) =>
      search.trim() === ""
        ? true
        : r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.id.toLowerCase().includes(search.toLowerCase())
    );

  const calculateMembersWithRole = (roleId: string) => {
    return space.members.all.filter((m) => m.roles.has(roleId)).length;
  };

  if (currentRole)
    return (
      <SpaceRoleEdit
        key={currentRole.id}
        membersWithRole={calculateMembersWithRole(currentRole.id)}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        roles={everyoneRole ? [...otherRoles, everyoneRole] : otherRoles}
        space={space}
      />
    );

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
        {otherRoles.length > 0 && (
          <Stack direction="column" spacing={2}>
            <Stack flex={1} direction="row" alignItems="center" px="1rem">
              <Typography flex={1}>Roles - {otherRoles.length}</Typography>
              <Typography flex={1}>Members</Typography>
              <Typography flex={1}>Actions</Typography>
            </Stack>
            <Divider
              lineColor="muted"
              css={{
                opacity: 0.25
              }}
            />
          </Stack>
        )}

        {otherRoles.length === 0 && (
          <Stack justifyContent="center" alignItems="center" py="4rem">
            <Typography textAlign="center" color="muted">
              No roles have been created for this space yet.
            </Typography>
          </Stack>
        )}
        <Stack direction="column" justifyContent="center">
          {otherRoles.map((role, i) => (
            <RoleItem
              membersWithRole={calculateMembersWithRole(role.id)}
              key={`role-${role.id}`}
              space={space}
              theme={theme}
              role={role}
              last={i === roles.length - 1}
              onClick={() => setCurrentRole(role)}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
});
