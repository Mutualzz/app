import { ActiveSessionsSettings } from "@components/UserSettings/ActiveSessionsSettings";
import { SettingsSection } from "@components/UserSettings/SettingsField";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const UserSessionsSettings = observer(() => {
  const { t } = useTranslation("settings");

  return (
    <Stack pt={2.5} pb={5} mx={20} direction="column">
      <SettingsSection description={t("account.activeSessionsDescription")}>
        <ActiveSessionsSettings />
      </SettingsSection>
    </Stack>
  );
});
