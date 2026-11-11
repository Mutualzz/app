import { UserSettingsModal } from "@components/UserSettings/UserSettingsModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { useOpenChannel } from "@renderer/hooks/useOpenChannel";
import {
  type RegisterableHotkey,
  type UseHotkeyOptions,
  useHotkeys
} from "@tanstack/react-hotkeys";
import { isElectron } from "@utils/index";
import {
  GLOBAL_SHORTCUT_IDS,
  isGlobalShortcutId,
  KEYBOARD_SHORTCUT_IDS,
  type KeyboardShortcutId,
  mergeKeyboardShortcuts,
  toElectronAccelerator
} from "@utils/keyboardShortcuts";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  QUICK_SWITCHER_MODAL_ID,
  QuickSwitcher
} from "./QuickSwitcher/QuickSwitcher";
import { useVoiceControls } from "@renderer/hooks/useVoiceControls";
import {
  KEYBOARD_SHORTCUTS_HELP_MODAL_ID,
  KeyboardShortcutsHelp
} from "./KeyboardShortcutsHelp/KeyboardShortcutsHelp";

interface ShortcutAction {
  run: () => void;
  options?: UseHotkeyOptions;
}

export const GlobalKeyboardShortcuts = observer(() => {
  const app = useAppStore();
  const openChannel = useOpenChannel();
  const { toggleMute, toggleDeafen, disconnect } = useVoiceControls();
  const { openModal, closeModal, isModalOpen } = useModal();
  const { t } = useTranslation("common");
  const shortcuts = mergeKeyboardShortcuts(app.keyboardShortcuts);

  const goToAdjacentUnreadChannel = (direction: 1 | -1) => {
    const channel = app.channels.getAdjacentUnreadChannel(direction);
    if (!channel) {
      app.announcer.announce(t("announce.noUnread"));
      return;
    }
    openChannel(channel);
    app.announcer.announce(channel.searchableName ?? "");
  };

  const announceMuteState = () => {
    if (app.voice.spaceMute) return;
    app.announcer.announce(
      t(app.voice.selfMute ? "announce.muted" : "announce.unmuted")
    );
  };

  const announceDeafenState = () => {
    if (app.voice.spaceDeaf) return;
    app.announcer.announce(
      t(app.voice.selfDeaf ? "announce.deafened" : "announce.undeafened")
    );
  };

  const actions: Record<KeyboardShortcutId, ShortcutAction> = {
    toggleMemberList: {
      run: () => app.setMemberListVisible(!app.memberListVisible)
    },
    openSettings: {
      run: () => openModal("user-settings", <UserSettingsModal />)
    },
    nextUnreadChannel: {
      run: () => goToAdjacentUnreadChannel(1),
      options: { ignoreInputs: false }
    },
    previousUnreadChannel: {
      run: () => goToAdjacentUnreadChannel(-1),
      options: { ignoreInputs: false }
    },
    quickSwitcher: {
      run: () => {
        if (isModalOpen(QUICK_SWITCHER_MODAL_ID)) {
          closeModal(QUICK_SWITCHER_MODAL_ID);
          return;
        }
        openModal(QUICK_SWITCHER_MODAL_ID, <QuickSwitcher />);
      },
      options: { ignoreInputs: false }
    },
    showShortcuts: {
      run: () => {
        if (isModalOpen(KEYBOARD_SHORTCUTS_HELP_MODAL_ID)) {
          closeModal(KEYBOARD_SHORTCUTS_HELP_MODAL_ID);
          return;
        }
        openModal(KEYBOARD_SHORTCUTS_HELP_MODAL_ID, <KeyboardShortcutsHelp />);
      },
      options: { ignoreInputs: false }
    },
    toggleMute: {
      run: () => {
        toggleMute();
        announceMuteState();
      },
      options: { ignoreInputs: false }
    },
    toggleDeafen: {
      run: () => {
        toggleDeafen();
        announceDeafenState();
      },
      options: { ignoreInputs: false }
    },
    disconnectVoice: {
      run: disconnect,
      options: { ignoreInputs: false }
    }
  };

  const isHandledGlobally = (id: KeyboardShortcutId) =>
    isElectron && app.voiceShortcutsWorkEverywhere && isGlobalShortcutId(id);

  useHotkeys(
    KEYBOARD_SHORTCUT_IDS.filter(
      (id) => !isHandledGlobally(id) && shortcuts[id].trim()
    ).map((id) => ({
      hotkey: shortcuts[id] as RegisterableHotkey,
      callback: actions[id].run,
      options: actions[id].options
    })),
    { ignoreInputs: true }
  );

  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const globalBindingsKey = JSON.stringify(
    Object.fromEntries(
      GLOBAL_SHORTCUT_IDS.map((id) => [
        id,
        isHandledGlobally(id)
          ? (toElectronAccelerator(shortcuts[id]) ?? "")
          : ""
      ])
    )
  );

  useEffect(() => {
    if (!isElectron) return;

    window.api.globalShortcuts
      .set(JSON.parse(globalBindingsKey))
      .then((failedIds) =>
        app.setGlobalShortcutFailures(failedIds.filter(isGlobalShortcutId))
      );
  }, [app, globalBindingsKey]);

  useEffect(() => {
    if (!isElectron) return;

    return window.api.globalShortcuts.onTriggered((id) => {
      if (!isGlobalShortcutId(id)) return;
      actionsRef.current[id].run();
    });
  }, []);

  return null;
});
