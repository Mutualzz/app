import { UserSettingsModal } from "@components/UserSettings/UserSettingsModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import type { RegisterableHotkey } from "@tanstack/hotkeys";
import { useHotkey } from "@tanstack/react-hotkeys";
import { mergeKeyboardShortcuts } from "@utils/keyboardShortcuts";
import { observer } from "mobx-react-lite";

export const GlobalKeyboardShortcuts = observer(() => {
  const app = useAppStore();
  const { openModal } = useModal();
  const shortcuts = mergeKeyboardShortcuts(app.keyboardShortcuts);

  useHotkey(
    shortcuts.toggleMemberList as RegisterableHotkey,
    () => {
      app.setMemberListVisible(!app.memberListVisible);
    },
    {
      enabled: !!shortcuts.toggleMemberList.trim(),
      ignoreInputs: true,
    }
  );

  useHotkey(
    shortcuts.openSettings as RegisterableHotkey,
    () => {
      openModal("user-settings", <UserSettingsModal />);
    },
    {
      enabled: !!shortcuts.openSettings.trim(),
      ignoreInputs: true,
    }
  );

  return null;
});
