import { observer } from "mobx-react-lite";
import type { Space } from "@stores/objects/Space";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import { ContextMenu } from "@components/ContextMenu";
import { useAppStore } from "@hooks/useStores";
import { ContextSubmenu } from "@components/ContextSubmenu";
import type { Role } from "@stores/objects/Role";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context";
import { Checkbox, Divider, Stack, Typography } from "@mutualzz/ui-web";
import { FaArrowLeft } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@components/Button";
import { useModal } from "@contexts/Modal.context";
import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal";
import { ContextItem } from "@components/ContextItem";
import { useNavigate } from "@tanstack/react-router";
import { ContextRoleItem } from "@components/ContextMenu/ContextRoleItem";
import { User } from "@stores/objects/User";
import { toast } from "react-toastify";
import { MemberKick } from "@components/Modals/MemberKick";
import { MemberBan } from "@components/Modals/MemberBan";

interface Props {
    user: User;
    space?: Space;
    member?: SpaceMember;
    insideDMs?: boolean;
}

export const UserContextMenu = observer(
    ({ user, space, member, insideDMs }: Props) => {
        const app = useAppStore();
        const navigate = useNavigate();
        const me = space?.members.me;
        const { openModal } = useModal();
        const { clearMenu } = useMenu();

        const isSelf = app.account?.id === user.id;

        const canManageRoles = member
            ? (me?.canManageMember(member, "ManageRoles") ?? false)
            : false;
        const canKickMember = member
            ? (me?.canManageMember(member, "KickMembers") ?? false)
            : false;
        const canBanMember = member
            ? (me?.canManageMember(member, "BanMembers") ?? false)
            : false;

        const canMuteMembers = me?.hasPermission("MuteMembers") ?? false;
        const canDeafenMembers = me?.hasPermission("DeafenMembers") ?? false;
        const canDisconnectMembers = me?.hasPermission("MoveMembers");

        const voiceState =
            space && member
                ? app.voiceStates.getBySpace(member.userId, space.id)
                : null;

        const relationship = app.relationships.getForMe(user.id);
        const isBlocked = relationship?.isBlocked ?? false;
        const isFriend = relationship?.isFriend ?? false;
        const isIncomingRequest = relationship?.isIncomingRequest ?? false;
        const isOutgoingRequest = relationship?.isOutgoingRequest ?? false;

        const meId = app.account?.id;
        const iBlockedThem = isBlocked && relationship?.userId === meId;

        const { mutate: openDm, isPending: openingDm } = useMutation({
            mutationKey: ["open-dm", user.id],
            mutationFn: async () =>
                user ? app.channels.openDM(user.id) : null,
            onSuccess: (channel) => {
                if (channel)
                    navigate({
                        to: `/@me/${channel.id}`,
                        replace: true
                    });
            }
        });

        const { mutate: closeDm, isPending: closingDm } = useMutation({
            mutationKey: ["close-dm", user.id],
            mutationFn: async () => {
                if (!user || !app.account) return null;

                const channel = app.channels.getDMChannel(
                    app.account.id,
                    user.id
                );
                if (!channel) return null;

                return app.channels.closeDM(channel.id);
            },
            onSuccess: () => {
                clearMenu();
            }
        });

        const { mutate: createRole, isPending: creatingRole } = useMutation({
            mutationKey: ["create-role", space?.id],
            mutationFn: async () => (space ? space.roles.create() : null),
            onSuccess: (role) => {
                if (!space || !role) return;
                space.roles.add(role);

                openModal(
                    "space-settings",
                    <SpaceSettingsModal space={space} redirectTo="roles" />
                );

                clearMenu();
            }
        });

        const { mutate: moderateMember, isPending: moderating } = useMutation({
            mutationKey: ["moderate-member", member?.id],
            mutationFn: async (action: "mute" | "deafen" | "disconnect") => {
                if (!space || !member) return null;
                const body: Record<string, boolean> = {};

                if (action === "mute") body.spaceMute = !voiceState?.spaceMute;
                else if (action === "deafen")
                    body.spaceDeaf = !voiceState?.spaceDeaf;
                else if (action === "disconnect") {
                    body.disconnect = true;
                    clearMenu();
                }

                return app.rest.patch(
                    `/spaces/${space.id}/members/${member.id}/voice`,
                    body
                );
            }
        });

        const { mutate: toggleRole, isPending: togglingRole } = useMutation({
            mutationKey: ["toggle-member-role", member?.id],
            mutationFn: async (role: Role) => {
                if (!canManageRoles)
                    throw new Error(
                        "You don't have permission to manage this member"
                    );

                if (!member) return null;

                if (member.roles.has(role.id)) return member.removeRole(role);

                return member.addRole(role);
            }
        });

        const { mutate: addFriend, isPending: addingFriend } = useMutation({
            mutationKey: ["add-friend", user.id],
            mutationFn: async () =>
                app.relationships.sendFriendRequest(user.id),
            onSuccess: (rel) => {
                if (rel) app.relationships.update(rel);
                clearMenu();
            },
            onError: (err) => {
                toast.error(err.message);
            }
        });

        const { mutate: acceptFriend, isPending: acceptingFriend } =
            useMutation({
                mutationKey: ["accept-friend", user.id],
                mutationFn: async () =>
                    app.relationships.acceptFriendRequest(user.id),
                onSuccess: (rel) => {
                    if (rel) app.relationships.update(rel);
                    clearMenu();
                }
            });

        const { mutate: declineFriend, isPending: decliningFriend } =
            useMutation({
                mutationKey: ["decline-friend", user.id],
                mutationFn: async () =>
                    app.relationships.declineFriendRequest(user.id),
                onSuccess: () => {
                    if (app.account?.id)
                        app.relationships.remove(app.account.id, user.id);
                    clearMenu();
                }
            });

        const { mutate: removeFriend, isPending: removingFriend } = useMutation(
            {
                mutationKey: ["remove-friend", user.id],
                mutationFn: async () => app.relationships.removeFriend(user.id),
                onSuccess: () => {
                    if (app.account?.id)
                        app.relationships.remove(app.account.id, user.id);
                    clearMenu();
                }
            }
        );

        const { mutate: blockUser, isPending: blockingUser } = useMutation({
            mutationKey: ["block-user", user.id],
            mutationFn: async () => app.relationships.blockUser(user.id),
            onSuccess: (rel) => {
                if (rel) app.relationships.update(rel);
                clearMenu();
            }
        });

        const { mutate: unblockUser, isPending: unblockingUser } = useMutation({
            mutationKey: ["unblock-user", user.id],
            mutationFn: async () => app.relationships.unblockUser(user.id),
            onSuccess: () => {
                if (app.account?.id)
                    app.relationships.remove(app.account.id, user.id);
                clearMenu();
            }
        });

        const manageableRoles = canManageRoles ? space?.roles.assignable : [];

        const assignedRoles = space?.roles.assignable.filter(
            (r) =>
                member?.roles.has(r.id) ||
                manageableRoles?.some((mr) => mr.id === r.id)
        );

        const id = generateMenuIDs.user(user.id, space?.id);

        return (
            <ContextMenu
                id={id}
                elevation={app.settings?.preferEmbossed ? 5 : 1}
                transparency={0}
                key={id}
            >
                {!isSelf && (
                    <>
                        {!insideDMs && (
                            <ContextItem
                                onClick={() => openDm()}
                                disabled={openingDm || iBlockedThem}
                            >
                                Message
                            </ContextItem>
                        )}

                        {insideDMs && (
                            <ContextItem
                                onClick={() => closeDm()}
                                disabled={closingDm}
                            >
                                Close DM
                            </ContextItem>
                        )}

                        {!isFriend &&
                            !isIncomingRequest &&
                            !isOutgoingRequest && (
                                <ContextItem
                                    onClick={() => addFriend()}
                                    disabled={addingFriend || iBlockedThem}
                                >
                                    Add Friend
                                </ContextItem>
                            )}

                        {isIncomingRequest && (
                            <>
                                <ContextItem
                                    onClick={() => acceptFriend()}
                                    disabled={acceptingFriend || iBlockedThem}
                                >
                                    Accept Friend Request
                                </ContextItem>
                                <ContextItem
                                    onClick={() => declineFriend()}
                                    disabled={decliningFriend || iBlockedThem}
                                >
                                    Decline Friend Request
                                </ContextItem>
                            </>
                        )}

                        {isOutgoingRequest && (
                            <ContextItem
                                onClick={() => declineFriend()}
                                disabled={decliningFriend || iBlockedThem}
                            >
                                Cancel Friend Request
                            </ContextItem>
                        )}

                        {isFriend && (
                            <ContextItem
                                onClick={() => removeFriend()}
                                disabled={removingFriend || iBlockedThem}
                            >
                                Remove Friend
                            </ContextItem>
                        )}

                        {iBlockedThem ? (
                            <ContextItem
                                onClick={() => unblockUser()}
                                disabled={unblockingUser}
                            >
                                Unblock
                            </ContextItem>
                        ) : (
                            <ContextItem
                                onClick={() => blockUser()}
                                disabled={blockingUser}
                            >
                                Block
                            </ContextItem>
                        )}

                        <Divider />
                    </>
                )}

                {space && member && (
                    <ContextSubmenu
                        elevation={app.settings?.preferEmbossed ? 5 : 1}
                        transparency={0}
                        arrow={<FaArrowLeft />}
                        label="Roles"
                        style={{
                            height:
                                assignedRoles?.length === 0 && !canManageRoles
                                    ? "2.5rem"
                                    : "15rem",
                            maxHeight: "15rem",
                            overflowY: "auto"
                        }}
                    >
                        {canManageRoles ? (
                            manageableRoles?.length === 0 ? (
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
                                manageableRoles?.map((role) => (
                                    <ContextRoleItem
                                        key={role.id}
                                        role={role}
                                        canManage={canManageRoles}
                                        hasRole={member.roles.has(role.id)}
                                        toggleRole={toggleRole}
                                        toggling={togglingRole}
                                    />
                                ))
                            )
                        ) : assignedRoles?.length === 0 ? (
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
                                ?.filter((r) => member.roles.has(r.id))
                                .map((role) => (
                                    <ContextRoleItem
                                        key={role.id}
                                        role={role}
                                        canManage={canManageRoles}
                                        toggleRole={toggleRole}
                                        hasRole={member.roles.has(role.id)}
                                        toggling={togglingRole}
                                    />
                                ))
                        )}
                    </ContextSubmenu>
                )}
                {voiceState && (
                    <>
                        {canMuteMembers && (
                            <ContextItem
                                variant="plain"
                                disabled={moderating}
                                onClick={() => {
                                    moderateMember("mute");
                                }}
                                closeOnClick={false}
                                style={{
                                    flex: 0
                                }}
                                size="sm"
                                color="danger"
                            >
                                <Stack
                                    justifyContent="space-between"
                                    flex={1}
                                    alignItems="center"
                                >
                                    <Stack alignItems="center" spacing={1.25}>
                                        <Typography
                                            color="danger"
                                            variant="plain"
                                            level="body-xs"
                                        >
                                            Space Mute
                                        </Typography>
                                    </Stack>
                                    <Checkbox
                                        disabled={moderating}
                                        color="neutral"
                                        checked={voiceState.spaceMute}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moderateMember("mute");
                                        }}
                                    />
                                </Stack>
                            </ContextItem>
                        )}
                        {canDeafenMembers && (
                            <ContextItem
                                variant="plain"
                                disabled={moderating}
                                onClick={() => {
                                    moderateMember("deafen");
                                }}
                                closeOnClick={false}
                                style={{
                                    flex: 0
                                }}
                                size="sm"
                                color="danger"
                            >
                                <Stack
                                    justifyContent="space-between"
                                    flex={1}
                                    alignItems="center"
                                >
                                    <Stack alignItems="center" spacing={1.25}>
                                        <Typography
                                            color="danger"
                                            variant="plain"
                                            level="body-xs"
                                        >
                                            Space Deafen
                                        </Typography>
                                    </Stack>
                                    <Checkbox
                                        disabled={moderating}
                                        color="neutral"
                                        checked={voiceState.spaceDeaf}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moderateMember("deafen");
                                        }}
                                    />
                                </Stack>
                            </ContextItem>
                        )}
                        {canDisconnectMembers && voiceState && (
                            <ContextItem
                                variant="plain"
                                disabled={moderating}
                                onClick={() => moderateMember("disconnect")}
                                closeOnClick={false}
                                style={{ flex: 0 }}
                                size="sm"
                                color="danger"
                            >
                                Disconnect
                            </ContextItem>
                        )}
                    </>
                )}
                {space && member && (
                    <>
                        {canKickMember && !isSelf && (
                            <ContextItem
                                variant="plain"
                                closeOnClick={false}
                                style={{ flex: 0 }}
                                size="sm"
                                color="danger"
                                onClick={() => {
                                    openModal(
                                        `kick-member-${member?.id}`,
                                        <MemberKick
                                            space={space}
                                            member={member}
                                        />
                                    );
                                }}
                            >
                                Kick {member?.user?.username}
                            </ContextItem>
                        )}
                        {canBanMember && !isSelf && (
                            <ContextItem
                                variant="plain"
                                closeOnClick={false}
                                style={{ flex: 0 }}
                                size="sm"
                                color="danger"
                                onClick={() => {
                                    openModal(
                                        `ban-member-${member?.id}`,
                                        <MemberBan
                                            space={space}
                                            member={member}
                                        />
                                    );
                                }}
                            >
                                Ban {member?.user?.username}
                            </ContextItem>
                        )}
                    </>
                )}
            </ContextMenu>
        );
    }
);
