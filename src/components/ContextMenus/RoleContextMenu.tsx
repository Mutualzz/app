import { observer } from "mobx-react-lite";
import type { Space } from "@stores/objects/Space";
import type { Role } from "@stores/objects/Role";
import { ContextMenu } from "@components/ContextMenu";
import { useAppStore } from "@hooks/useStores";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context.tsx";
import { Item } from "@mutualzz/contexify";
import { useMutation } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";

interface Props {
    space: Space;
    role: Role;
    onDelete?: () => void;
}

export const RoleContextMenu = observer(({ space, role, onDelete }: Props) => {
    const app = useAppStore();
    const { clearMenu } = useMenu();

    const { mutate: deleteRole, isPending: deletingRole } = useMutation({
        mutationKey: ["delete-role", role.id],
        mutationFn: async () => role.delete(),
        onSuccess: async () => {
            clearMenu();
            onDelete?.();
        },
    });

    if (role.id === space.id) return null;

    return (
        <ContextMenu
            id={generateMenuIDs.role(space.id, role.id)}
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            transparency={0}
            key={`${space.id}-${role.id}`}
        >
            <Item
                onClick={() => deleteRole()}
                endDecorator={<FaTrash />}
                color="danger"
                size="sm"
                disabled={deletingRole}
            >
                Delete Role
            </Item>
        </ContextMenu>
    );
});
