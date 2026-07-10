import { useMenu } from "@contexts/ContextMenu.context";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
  notifySpaceLockdownBlocked,
  shouldCloseModalDuringSpaceLockdown
} from "@utils/spaceLockdown";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const SpaceLockdownGuard = observer(() => {
  const app = useAppStore();
  const { closeModal, modals } = useModal();
  const { clearMenu } = useMenu();
  const space = app.spaces.active;
  const isLockedDown = space?.isInLockdown ?? false;

  useEffect(() => {
    if (!isLockedDown) return;

    notifySpaceLockdownBlocked(true);
    clearMenu();

    for (const modal of modals) {
      if (shouldCloseModalDuringSpaceLockdown(modal.id)) {
        closeModal(modal.id);
      }
    }
  }, [isLockedDown, space?.id]);

  return null;
});
