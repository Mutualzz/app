import { observer } from "mobx-react-lite";
import type { Space } from "@stores/objects/Space";
import type { Role } from "@stores/objects/Role";
import { ContextMenu } from "@components/ContextMenu";
import { useAppStore } from "@hooks/useStores";
import { generateMenuIDs } from "@contexts/ContextMenu.context";
import { RoleActionConfirm } from "@components/Modals/RoleActionConfirm";
import { useModal } from "@contexts/Modal.context";
import { ContextItem } from "@components/ContextItem";
import { TrashIcon } from "@phosphor-icons/react";

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
      <ContextItem
        onClick={() =>
          openModal("delete-role", <RoleActionConfirm role={role} />)
        }
        endDecorator={<TrashIcon weight="fill" />}
        color="danger"
        size="sm"
      >
        Delete Role
      </ContextItem>
    </ContextMenu>
  );
});
