import { Button } from "@components/Button";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import {
  formatForDisplay,
  useHotkeyRecorder,
  type Hotkey
} from "@tanstack/react-hotkeys";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  findKeyboardShortcutConflict,
  isKeyboardShortcutCustomized,
  KEYBOARD_SHORTCUT_IDS,
  mergeKeyboardShortcuts,
  type KeyboardShortcutId
} from "@utils/keyboardShortcuts";

export const KeyboardShortcutsSettings = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const shortcuts = mergeKeyboardShortcuts(app.keyboardShortcuts);
  const recordingIdRef = useRef<KeyboardShortcutId | null>(null);
  const [recordingId, setRecordingId] = useState<KeyboardShortcutId | null>(
    null
  );
  const [conflict, setConflict] = useState<{
    sourceId: KeyboardShortcutId;
    conflictId: KeyboardShortcutId;
  } | null>(null);

  const recorder = useHotkeyRecorder({
    ignoreInputs: false,
    onRecord: (hotkey) => {
      const id = recordingIdRef.current;
      if (!id) return;

      recordingIdRef.current = null;
      setRecordingId(null);

      if (!hotkey) {
        app.setKeyboardShortcut(id, "");
        setConflict(null);
        return;
      }

      const nextConflict = findKeyboardShortcutConflict(
        id,
        hotkey,
        mergeKeyboardShortcuts(app.keyboardShortcuts)
      );

      if (nextConflict) {
        setConflict({ sourceId: id, conflictId: nextConflict });
        return;
      }

      app.setKeyboardShortcut(id, hotkey);
      setConflict(null);
    },
    onCancel: () => {
      recordingIdRef.current = null;
      setRecordingId(null);
      setConflict(null);
    }
  });

  const startEdit = (id: KeyboardShortcutId) => {
    if (recorder.isRecording) {
      recorder.cancelRecording();
    }

    recordingIdRef.current = id;
    setRecordingId(id);
    setConflict(null);
    recorder.startRecording();
  };

  const displayHotkey = (id: KeyboardShortcutId) => {
    const hotkey = shortcuts[id];
    if (!hotkey.trim()) {
      return t("keybinds.disabled");
    }

    if (recordingId === id && recorder.recordedHotkey) {
      return formatForDisplay(recorder.recordedHotkey);
    }

    return formatForDisplay(hotkey as Hotkey);
  };

  return (
    <Stack direction="column" spacing={1.5}>
      {KEYBOARD_SHORTCUT_IDS.map((id) => {
        const isRecording = recordingId === id && recorder.isRecording;
        const isCustomized = isKeyboardShortcutCustomized(id, shortcuts);

        return (
          <Stack
            key={id}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="column" spacing={0.25} minWidth={0} flex={1}>
              <Typography level="body-sm">
                {t(`keybinds.shortcuts.${id}`)}
              </Typography>
              {conflict?.sourceId === id && (
                <Typography level="body-xs" color="danger">
                  {t("keybinds.conflict", {
                    action: t(`keybinds.shortcuts.${conflict.conflictId}`)
                  })}
                </Typography>
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                level="body-sm"
                textColor={isRecording ? "primary" : "muted"}
                css={{
                  minWidth: "6rem",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                {isRecording ? t("keybinds.pressKey") : displayHotkey(id)}
              </Typography>

              <Button
                variant={isRecording ? "solid" : "soft"}
                color={isRecording ? "primary" : "neutral"}
                size="sm"
                onClick={() => {
                  if (isRecording) {
                    recorder.cancelRecording();
                    return;
                  }
                  startEdit(id);
                }}
              >
                {isRecording ? t("keybinds.cancel") : t("keybinds.edit")}
              </Button>

              {isCustomized && !isRecording && (
                <Button
                  variant="plain"
                  size="sm"
                  onClick={() => app.resetKeyboardShortcut(id)}
                >
                  {t("keybinds.reset")}
                </Button>
              )}
            </Stack>
          </Stack>
        );
      })}

      <Typography level="body-xs" textColor="muted">
        {t("keybinds.clearHint")}
      </Typography>

      <Button
        variant="outlined"
        size="sm"
        css={{ alignSelf: "flex-start" }}
        onClick={() => app.resetKeyboardShortcuts()}
      >
        {t("keybinds.resetAll")}
      </Button>
    </Stack>
  );
});
