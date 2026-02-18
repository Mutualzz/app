import { observer } from "mobx-react-lite";
import type { Space } from "@stores/objects/Space.ts";
import type { SpaceMember } from "@stores/objects/SpaceMember.ts";
import { ContextMenu } from "@components/ContextMenu.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { ContextSubmenu } from "@components/ContextSubmenu.tsx";
import type { Role } from "@stores/objects/Role.ts";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context.tsx";
import { Box, Checkbox, Stack, Typography } from "@mutualzz/ui-web";
import { FaArrowLeft } from "react-icons/fa";
import { styled } from "@mutualzz/ui-core";
import { useMutation } from "@tanstack/react-query";
import { Item } from "@mutualzz/contexify";
import { Button } from "@components/Button.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal.tsx";

interface Props {
    space: Space;
    member: SpaceMember;
}

const RoleColorBlob = styled("span")<{ color: string }>(({ color }) => ({
    width: 12,
    height: 12,
    backgroundColor: color,
    borderRadius: "50%",
}));

interface RoleItemProps {
    role: Role;
    canManage: boolean;
    toggleRole: Function;
    hasRole: boolean;
    toggling: boolean;
}

const RoleItem = observer(
    ({ role, hasRole, canManage, toggleRole, toggling }: RoleItemProps) => {
        return (
            <Item
                variant="plain"
                disabled={toggling}
                onClick={() => {
                    toggleRole(role);
                }}
                closeOnClick={false}
                style={{
                    flex: 0,
                }}
            >
                <Stack
                    justifyContent="space-between"
                    flex={1}
                    alignItems="center"
                >
                    <Stack alignItems="center" spacing={1.25}>
                        <RoleColorBlob color={role.color} />
                        <Typography level="body-sm">{role.name}</Typography>
                    </Stack>

                    {canManage ? (
                        <span data-menu-interactive>
                            <Checkbox
                                disabled={toggling}
                                color="neutral"
                                checked={hasRole}
                            />
                        </span>
                    ) : undefined}
                </Stack>
            </Item>
        );
    },
);

export const SpaceMemberContextMenu = observer(({ space, member }: Props) => {
    const app = useAppStore();
    const me = space.members.me;
    const { openModal } = useModal();
    const { clearMenu } = useMenu();

    const canManage = me?.canManageMember(member) ?? false;

    const { mutate: createRole, isPending: creatingRole } = useMutation({
        mutationKey: ["create-role", space.id],
        mutationFn: async () => space.roles.create(),
        onSuccess: (data) => {
            space.roles.add(data);

            openModal(
                "space-settings",
                <SpaceSettingsModal space={space} redirectTo="roles" />,
            );

            clearMenu();
        },
    });

    const { mutate: toggleRole, isPending: togglingRole } = useMutation({
        mutationKey: ["toggle-member-role", member.id],
        mutationFn: async (role: Role) => {
            if (!canManage)
                throw new Error(
                    "You don't have permission to manage this member",
                );

            if (member.roles.has(role.id)) return member.removeRole(role);

            return member.addRole(role);
        },
    });

    const manageableRoles = canManage ? space.roles.assignable : [];

    const assignedRoles = space.roles.assignable.filter(
        (r) =>
            member.roles.has(r.id) ||
            manageableRoles.some((mr) => mr.id === r.id),
    );

    return (
        <ContextMenu
            id={generateMenuIDs.member(space.id, member.id)}
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            transparency={0}
            key={`${space.id}-${member.id}`}
        >
            <Box>
                <ContextSubmenu
                    elevation={app.settings?.preferEmbossed ? 5 : 1}
                    transparency={0}
                    arrow={<FaArrowLeft />}
                    inverted
                    label="Roles"
                    style={{
                        height:
                            assignedRoles.length === 0 && !canManage
                                ? "2.5rem"
                                : "15rem",
                        maxHeight: "15rem",
                        overflowY: "auto",
                    }}
                >
                    {canManage ? (
                        manageableRoles.length === 0 ? (
                            <Stack
                                direction="column"
                                justifyContent="center"
                                alignItems="center"
                                height="100%"
                                spacing={1.25}
                            >
                                <Typography level="body-sm">
                                    No roles to assign
                                </Typography>
                                <Button
                                    color="info"
                                    size="sm"
                                    onClick={() => createRole()}
                                    disabled={creatingRole}
                                >
                                    Create role
                                </Button>
                            </Stack>
                        ) : (
                            manageableRoles.map((role) => (
                                <RoleItem
                                    key={role.id}
                                    role={role}
                                    canManage={canManage}
                                    hasRole={member.roles.has(role.id)}
                                    toggleRole={toggleRole}
                                    toggling={togglingRole}
                                />
                            ))
                        )
                    ) : assignedRoles.length === 0 ? (
                        <Stack
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                        >
                            <Typography level="body-sm">
                                No roles assigned
                            </Typography>
                        </Stack>
                    ) : (
                        assignedRoles
                            .filter((r) => member.roles.has(r.id))
                            .map((role) => (
                                <RoleItem
                                    key={role.id}
                                    role={role}
                                    canManage={canManage}
                                    toggleRole={toggleRole}
                                    hasRole={member.roles.has(role.id)}
                                    toggling={togglingRole}
                                />
                            ))
                    )}
                </ContextSubmenu>
            </Box>
        </ContextMenu>
    );
});
