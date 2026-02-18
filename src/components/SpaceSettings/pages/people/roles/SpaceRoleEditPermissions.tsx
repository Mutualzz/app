import type { APIRole } from "@mutualzz/types";
import { Button, Divider, Stack, Switch, Typography } from "@mutualzz/ui-web";
import {
    BitField,
    type PermissionFlag,
    type PermissionFlags,
    permissionFlags,
} from "@mutualzz/permissions";
import { type ReactNode, useMemo } from "react";

interface Props {
    changes: Partial<Omit<APIRole, "id">>;
    setChanges: (
        next:
            | Partial<Omit<APIRole, "id">>
            | ((
                  prev: Partial<Omit<APIRole, "id">>,
              ) => Partial<Omit<APIRole, "id">>),
    ) => void;
}

const PermissionItem = ({
    flag,
    label,
    description,
    hasPermission,
    togglePermission,
}: {
    flag: PermissionFlag;
    label: ReactNode;
    description?: ReactNode;
    hasPermission: boolean;
    togglePermission: (flag: PermissionFlag) => void;
}) => {
    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mr={5}
            flex={1}
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
                onChange={() => togglePermission(flag)}
            />
        </Stack>
    );
};

export const SpaceRoleEditPermissions = ({ changes, setChanges }: Props) => {
    const permissions = useMemo<BitField<PermissionFlags>>(() => {
        if (!changes.permissions)
            return BitField.fromString(permissionFlags, "0");
        return BitField.fromString(
            permissionFlags,
            changes.permissions.toString(),
        );
    }, [changes.permissions]);

    const togglePermission = (flag: PermissionFlag) => {
        const hasPermission = permissions.has(flag);
        const newPermissions = hasPermission
            ? permissions.remove(flag)
            : permissions.add(flag);

        setChanges((prev) => ({
            ...prev,
            permissions: newPermissions.bits,
        }));
    };

    const clearPermissions = () => {
        setChanges((prev) => ({
            ...prev,
            permissions: 0n,
        }));
    };

    return (
        <Stack direction="column" justifyContent="center" pb={10} spacing={5}>
            <Stack justifyContent="space-between" mr={5} alignItems="center">
                <Typography level="body-lg">
                    General Space Permissions
                </Typography>
                <Button
                    color="danger"
                    onClick={() => clearPermissions()}
                    size="sm"
                    variant="soft"
                    disabled={permissions.toArray().length === 0}
                >
                    Clear permissions
                </Button>
            </Stack>
            <Stack direction="column" spacing={2.5}>
                <PermissionItem
                    flag="ViewChannel"
                    label="View Channels"
                    description="Allow members to view channels by default"
                    hasPermission={permissions.has("ViewChannel")}
                    togglePermission={togglePermission}
                />
                <Divider css={{ opacity: 0.5 }} />
                <PermissionItem
                    flag="ManageChannels"
                    label="Manage Channels"
                    description="Allow members to create, edit or delete channels"
                    hasPermission={permissions.has("ManageChannels")}
                    togglePermission={togglePermission}
                />
                <Divider css={{ opacity: 0.5 }} />
                <PermissionItem
                    flag="ManageRoles"
                    label="Manage Roles"
                    description="Allows members to create new roles and edit or delete roles lower than their highest role"
                    hasPermission={permissions.has("ManageRoles")}
                    togglePermission={togglePermission}
                />
                <Divider css={{ opacity: 0.5 }} />
                <PermissionItem
                    flag="ManageInvites"
                    label="Manage Invites"
                    description="Allows member to edit or delete invites. P.S Creating invites is on a different permission"
                    hasPermission={permissions.has("ManageInvites")}
                    togglePermission={togglePermission}
                />
                <Divider css={{ opacity: 0.5 }} />
                <PermissionItem
                    flag="ManageSpace"
                    label="Manage Space"
                    description="Allow members to change this space's name (currently not implemented fully)"
                    hasPermission={permissions.has("ManageSpace")}
                    togglePermission={togglePermission}
                />
            </Stack>
            <Stack direction="column" spacing={2.5}>
                <Stack alignItems="center">
                    <Typography level="body-lg">
                        Membership Permissions
                    </Typography>
                </Stack>
                <PermissionItem
                    flag="CreateInvites"
                    label="Create Invites"
                    description="Allow members to invite new people to this space"
                    hasPermission={permissions.has("CreateInvites")}
                    togglePermission={togglePermission}
                />
                <Divider css={{ opacity: 0.5 }} />
                <PermissionItem
                    flag="KickMembers"
                    label="Kick Members"
                    description="Kick will remove other members from this space. Kicked members can rejoin if they have another invite."
                    hasPermission={permissions.has("KickMembers")}
                    togglePermission={togglePermission}
                />
                <Divider css={{ opacity: 0.5 }} />
                <PermissionItem
                    flag="BanMembers"
                    label="Ban Members"
                    description="Ban will remove members from this space and prevent them from rejoining until they are unbanned."
                    hasPermission={permissions.has("BanMembers")}
                    togglePermission={togglePermission}
                />
            </Stack>
            <Stack direction="column" spacing={2.5}>
                <Stack alignItems="center">
                    <Typography level="body-lg">
                        Text Channel Permissions
                    </Typography>
                </Stack>
                <PermissionItem
                    flag="SendMessages"
                    label="Send Messages"
                    description="Allow members to send messages in text channels"
                    hasPermission={permissions.has("SendMessages")}
                    togglePermission={togglePermission}
                />
            </Stack>
            <Stack direction="column" spacing={2.5}>
                <Stack alignItems="center">
                    <Typography level="body-lg">
                        Advanced Permissions
                    </Typography>
                </Stack>
                <PermissionItem
                    flag="Administrator"
                    label="Administrator"
                    description={
                        <>
                            Members with this permission will have every
                            permission.{" "}
                            <b>This is a dangerous permission to grant</b>.
                        </>
                    }
                    hasPermission={permissions.has("Administrator")}
                    togglePermission={togglePermission}
                />
            </Stack>
        </Stack>
    );
};
