import type { APIRole } from "@mutualzz/types";
import { Button, Divider, Stack, Switch, Typography } from "@mutualzz/ui-web";
import {
    BitField,
    type PermissionFlag,
    type PermissionFlags,
    permissionFlags
} from "@mutualzz/bitfield";
import { type ReactNode } from "react";
import { observer } from "mobx-react-lite";

interface Props {
    changes: Partial<Omit<APIRole, "id">>;
    setChanges: (
        next:
            | Partial<Omit<APIRole, "id">>
            | ((
                  prev: Partial<Omit<APIRole, "id">>
              ) => Partial<Omit<APIRole, "id">>)
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
}) => (
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
            shape="circle"
            onChange={() => togglePermission(flag)}
        />
    </Stack>
);

export const SpaceRoleEditPermissions = observer(
    ({ changes, setChanges }: Props) => {
        const permissions: BitField<PermissionFlags> = changes.allow
            ? BitField.fromString(permissionFlags, changes.allow.toString())
            : BitField.fromString(permissionFlags, "0");

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

        return (
            <Stack
                direction="column"
                justifyContent="center"
                pb={10}
                spacing={5}
            >
                <Stack
                    justifyContent="space-between"
                    mr={5}
                    alignItems="center"
                >
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
                        flag="CreateExpressions"
                        label="Create Expressions"
                        description="Allow members to create emoji and stickers in this space."
                        hasPermission={permissions.has("CreateExpressions")}
                        togglePermission={togglePermission}
                    />
                    <Divider css={{ opacity: 0.5 }} />
                    <PermissionItem
                        flag="ManageExpressions"
                        label="Manage Expressions"
                        description="Allow members to edit or delete emoji and stickers in this space."
                        hasPermission={permissions.has("ManageExpressions")}
                        togglePermission={togglePermission}
                    />
                    <Divider css={{ opacity: 0.5 }} />
                    <PermissionItem
                        flag="ManageSpace"
                        label="Manage Space"
                        description="Allow members to change this space"
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
                    <PermissionItem
                        flag="EmbedLinks"
                        label="Embed Links"
                        description="Allow members to embed links in messages"
                        hasPermission={permissions.has("EmbedLinks")}
                        togglePermission={togglePermission}
                    />
                    <PermissionItem
                        flag="AttachFiles"
                        label="Attach Files"
                        description="Allow members to attach files in messages"
                        hasPermission={permissions.has("AttachFiles")}
                        togglePermission={togglePermission}
                    />
                    <PermissionItem
                        flag="MentionEveryone"
                        label="Mention Everyone"
                        description="Allow members to mention @everyone and @here in messages"
                        hasPermission={permissions.has("MentionEveryone")}
                        togglePermission={togglePermission}
                    />
                    <PermissionItem
                        flag="UseExternalEmojis"
                        label="Use External Emojis"
                        description="Allow members to use emojis from other spaces or their own in their messages"
                        hasPermission={permissions.has("UseExternalEmojis")}
                        togglePermission={togglePermission}
                    />
                    <PermissionItem
                        flag="ManageMessages"
                        label="Manage Messages"
                        description="Allow members to delete other members messages"
                        hasPermission={permissions.has("ManageMessages")}
                        togglePermission={togglePermission}
                    />
                    <PermissionItem
                        flag="ReadMessageHistory"
                        label="Read Message History"
                        description="Allow members to read message history"
                        hasPermission={permissions.has("ReadMessageHistory")}
                        togglePermission={togglePermission}
                    />
                </Stack>
                <Stack direction="column" spacing={2.5}>
                    <Stack alignItems="center">
                        <Typography level="body-lg">
                            Voice Channel Permissions
                        </Typography>
                    </Stack>
                    <PermissionItem
                        flag="Connect"
                        label="Connect"
                        description="Allow members to connect to voice channels"
                        hasPermission={permissions.has("Connect")}
                        togglePermission={togglePermission}
                    />
                    <PermissionItem
                        flag="Speak"
                        label="Speak"
                        description="Allow members to speak in voice channels"
                        hasPermission={permissions.has("Speak")}
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
                                <Typography
                                    color="danger"
                                    variant="plain"
                                    fontWeight="bold"
                                >
                                    This is a dangerous permission to grant
                                </Typography>
                                .
                            </>
                        }
                        hasPermission={permissions.has("Administrator")}
                        togglePermission={togglePermission}
                    />
                </Stack>
            </Stack>
        );
    }
);
