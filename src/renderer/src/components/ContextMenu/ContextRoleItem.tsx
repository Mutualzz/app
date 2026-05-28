import { observer } from "mobx-react-lite";
import { ContextItem } from "@components/ContextItem";
import { Checkbox, Stack, Typography } from "@mutualzz/ui-web";
import styled from "@emotion/styled";
import { Role } from "@stores/objects/Role";

const RoleColorBlob = styled("span")<{ color: string }>(({ color }) => ({
    width: 12,
    height: 12,
    backgroundColor: color,
    borderRadius: "50%"
}));

interface RoleItemProps {
    role: Role;
    canManage: boolean;
    toggleRole: Function;
    hasRole: boolean;
    toggling: boolean;
}

export const ContextRoleItem = observer(
    ({ role, hasRole, canManage, toggleRole, toggling }: RoleItemProps) => {
        return (
            <ContextItem
                variant="plain"
                disabled={toggling}
                onClick={() => {
                    toggleRole(role);
                }}
                closeOnClick={false}
                style={{
                    flex: 0
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
                        <Checkbox
                            disabled={toggling}
                            color="neutral"
                            checked={hasRole}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleRole(role);
                            }}
                        />
                    ) : undefined}
                </Stack>
            </ContextItem>
        );
    }
);
