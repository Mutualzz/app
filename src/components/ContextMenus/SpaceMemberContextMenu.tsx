import { observer } from "mobx-react-lite";
import type { Space } from "@stores/objects/Space.ts";
import type { SpaceMember } from "@stores/objects/SpaceMember.ts";
import { ContextMenu } from "@components/ContextMenu.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { ContextSubmenu } from "@components/ContextSubmenu.tsx";
import type { Role } from "@stores/objects/Role.ts";
import { generateMenuIDs } from "@contexts/ContextMenu.context.tsx";
import { Box, Checkbox, Typography } from "@mutualzz/ui-web";
import { FaArrowLeft } from "react-icons/fa";
import { styled } from "@mutualzz/ui-core";
import { useMutation } from "@tanstack/react-query";
import { Item } from "@mutualzz/contexify";

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
                startDecorator={<RoleColorBlob color={role.color} />}
                endDecorator={
                    canManage ? (
                        <span data-menu-interactive>
                            <Checkbox
                                disabled={toggling}
                                color="neutral"
                                checked={hasRole}
                            />
                        </span>
                    ) : undefined
                }
                onClick={() => {
                    toggleRole(role);
                }}
                style={{
                    flex: 0,
                }}
                closeOnClick={false}
            >
                <Typography level="body-sm">{role.name}</Typography>
            </Item>
        );
    },
);

export const SpaceMemberContextMenu = observer(({ space, member }: Props) => {
    const app = useAppStore();
    const me = space.members.me;

    const canManage = me?.canManageMember(member) ?? false;

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
                        minHeight: "15rem",
                        maxHeight: "15rem",
                        overflowY: "auto",
                    }}
                >
                    {canManage &&
                        space.roles.assignable.map((role) => (
                            <RoleItem
                                key={role.id}
                                role={role}
                                canManage={canManage}
                                hasRole={member.roles.has(role.id)}
                                toggleRole={toggleRole}
                                toggling={togglingRole}
                            />
                        ))}
                    {!canManage &&
                        space.roles.assignable
                            .filter((r) => member.roles.has(r.id))
                            .map((role) => (
                                <RoleItem
                                    role={role}
                                    canManage={canManage}
                                    toggleRole={toggleRole}
                                    hasRole={member.roles.has(role.id)}
                                    toggling={togglingRole}
                                />
                            ))}
                </ContextSubmenu>
            </Box>
        </ContextMenu>
    );
});
