import { observer } from "mobx-react-lite";
import type { Space } from "@stores/objects/Space";
import type { Role } from "@stores/objects/Role";
import { ContextMenu } from "@components/ContextMenu";
import { useAppStore } from "@hooks/useStores";
import { generateMenuIDs } from "@contexts/ContextMenu.context.tsx";
import { Item } from "@mutualzz/contexify";
import { FaTrash } from "react-icons/fa";
import { RoleActionConfirm } from "@components/Modals/RoleActionConfirm.tsx";
import { useModal } from "@contexts/Modal.context.tsx";

interface Props {
    space: Space;
    role: Role;
}

export const RoleContextMenu = observer(({ space, role }: Props) => {
    const app = useAppStore();
    const { openModal } = useModal();

    if (role.id === space.id) return null;

    return (
        <ContextMenu
            id={generateMenuIDs.role(space.id, role.id)}
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            transparency={0}
            key={`${space.id}-${role.id}`}
        >
            <Item
                onClick={() =>
                    openModal("delete-role", <RoleActionConfirm role={role} />)
                }
                endDecorator={<FaTrash />}
                color="danger"
                size="sm"
            >
                Delete Role
            </Item>
        </ContextMenu>
    );
});
