import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Divider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import {
  KEYBOARD_SHORTCUT_IDS,
  mergeKeyboardShortcuts
} from "@utils/keyboardShortcuts";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const KEYBOARD_SHORTCUTS_HELP_MODAL_ID = "keyboard-shortcuts-help";

const FIXED_SHORTCUTS = [
  { id: "sendMessage", hotkey: "Enter" },
  { id: "newLine", hotkey: "Shift+Enter" },
  { id: "editLastMessage", hotkey: "ArrowUp" },
  { id: "closeOrCancel", hotkey: "Escape" },
  { id: "switcherNavigate", hotkey: "ArrowDown" },
  { id: "zoomIn", hotkey: "Mod+=" },
  { id: "zoomOut", hotkey: "Mod+-" },
  { id: "zoomReset", hotkey: "Mod+0" },
  { id: "messageNavigate", hotkey: "ArrowUp" },
  { id: "messageReply", hotkey: "R" },
  { id: "messageEdit", hotkey: "E" },
  { id: "messageBookmark", hotkey: "B" },
  { id: "messagePin", hotkey: "P" },
  { id: "messageReact", hotkey: "+", display: "+" },
  { id: "messageDelete", hotkey: "Shift+Delete" },
  { id: "messageMenu", hotkey: "Shift+F10" }
] as const;

interface ShortcutRowProps {
  label: string;
  keys: string;
}

const ShortcutRow = ({ label, keys }: ShortcutRowProps) => {
  const { theme } = useTheme();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      py={1}
    >
      <Typography level="body-sm">{label}</Typography>
      <kbd
        css={{
          fontFamily: "inherit",
          fontSize: "0.8rem",
          padding: "0.15rem 0.5rem",
          borderRadius: 6,
          border: `1px solid ${theme.colors.neutral}`,
          whiteSpace: "nowrap"
        }}
      >
        {keys}
      </kbd>
    </Stack>
  );
};

export const KeyboardShortcutsHelp = observer(() => {
  const app = useAppStore();
  const { t } = useTranslation("settings");
  const shortcuts = mergeKeyboardShortcuts(app.keyboardShortcuts);

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      spacing={2}
      width="min(520px, 90vw)"
      css={{ maxHeight: "80vh", overflowY: "auto" }}
      role="dialog"
      aria-labelledby="keyboard-shortcuts-help-title"
    >
      <Typography
        id="keyboard-shortcuts-help-title"
        level="h5"
        fontWeight="bold"
      >
        {t("keybinds.help.title")}
      </Typography>

      <Typography level="body-xs" textColor="muted" fontWeight={600}>
        {t("keybinds.help.yours")}
      </Typography>
      <Stack direction="column">
        {KEYBOARD_SHORTCUT_IDS.map((id) => (
          <ShortcutRow
            key={id}
            label={t(`keybinds.shortcuts.${id}`)}
            keys={
              shortcuts[id].trim()
                ? formatForDisplay(shortcuts[id])
                : t("keybinds.disabled")
            }
          />
        ))}
      </Stack>

      <Divider />

      <Typography level="body-xs" textColor="muted" fontWeight={600}>
        {t("keybinds.help.fixed")}
      </Typography>
      <Stack direction="column">
        {FIXED_SHORTCUTS.map((shortcut) => (
          <ShortcutRow
            key={shortcut.id}
            label={t(`keybinds.help.fixedShortcuts.${shortcut.id}`)}
            keys={
              "display" in shortcut
                ? shortcut.display
                : formatForDisplay(shortcut.hotkey)
            }
          />
        ))}
      </Stack>

      <Typography level="body-xs" textColor="muted">
        {t("keybinds.help.customizeHint")}
      </Typography>
    </Paper>
  );
});
