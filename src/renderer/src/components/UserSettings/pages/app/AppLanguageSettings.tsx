import { useAppStore } from "@hooks/useStores";
import {
  type AppLocale,
  localeNativeNames,
  supportedLocales
} from "@mutualzz/i18n";
import { Stack } from "@mutualzz/ui-web";
import { getPreferredLocale, setPreferredLocale } from "@renderer/i18n";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SettingsSection,
  SettingsSelectField,
  SettingsToggleRow
} from "@components/UserSettings/SettingsField";

export const AppLanguageSettings = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const [preferredLocale, setPreferredLocaleState] = useState<
    AppLocale | "system"
  >(() => getPreferredLocale() ?? "system");

  return (
    <Stack direction="column" pt={2.5} pb={5} spacing={7.5}>
      <SettingsSection title={tCommon("language.title")}>
        <SettingsSelectField
          title={tCommon("language.title")}
          description={tCommon("language.description")}
          value={preferredLocale}
          onChange={(value) => {
            const next = value as AppLocale | "system";
            setPreferredLocaleState(next);
            setPreferredLocale(next);
          }}
          options={[
            { value: "system", label: tCommon("language.systemDefault") },
            ...supportedLocales.map((locale) => ({
              value: locale,
              label: localeNativeNames[locale]
            }))
          ]}
        />
      </SettingsSection>
      <SettingsSection title={t("languageInput.inputTitle")}>
        <SettingsToggleRow
          title={t("appearance.convertEmoticons")}
          description={t("appearance.convertEmoticonsDescription")}
          checked={!!app.settings?.convertEmoticons}
          onChange={(checked) => {
            if (!app.settings) return;
            app.settings.patchSettings({ convertEmoticons: checked });
            app.settings.flush();
          }}
        />
        {isElectron ? (
          <SettingsToggleRow
            title={t("appearance.spellcheck")}
            description={t("appearance.spellcheckDescription")}
            checked={!!app.settings?.spellcheckEnabled}
            onChange={() => app.settings?.toggleSpellcheckEnabled()}
          />
        ) : null}
      </SettingsSection>
    </Stack>
  );
});
