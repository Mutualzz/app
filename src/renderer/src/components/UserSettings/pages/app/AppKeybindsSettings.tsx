import { KeyboardShortcutsSettings } from "@components/UserSettings/KeyboardShortcutsSettings";
import { SettingsSection } from "@components/UserSettings/SettingsField";
import { Stack } from "@mutualzz/ui-web";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const AppKeybindsSettings = observer(() => {
  const { t } = useTranslation("settings");

  if (!isElectron) return null;

  return (
    <Stack spacing={7.5} pt={2.5} pb={5} direction="column">
      <SettingsSection
        title={t("keybinds.title")}
        description={t("keybinds.description")}
      >
        <KeyboardShortcutsSettings />
      </SettingsSection>
    </Stack>
  );
});
