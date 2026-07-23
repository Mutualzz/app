import { useAppStore } from "@hooks/useStores";
import { BADGE_COLOR_PRESETS } from "@mutualzz/types";
import { formatColor } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { SCREEN_SHARE_QUALITY_OPTIONS } from "@utils/voiceSettings.utils";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SettingsSection,
  SettingsSelectField,
  SettingsToggleRow
} from "@components/UserSettings/SettingsField";

export const AppDesktopSettings = observer(() => {
  const { t } = useTranslation("settings");
  const { theme } = useTheme();
  const app = useAppStore();
  const settings = app.settings;
  const [launchAtLogin, setLaunchAtLogin] = useState(false);

  useEffect(() => {
    if (!isElectron || !window.api?.desktop?.getAutostart) return;
    void window.api.desktop.getAutostart().then(setLaunchAtLogin);
  }, []);

  if (!settings || !isElectron) return null;

  const extended = settings.extendedSettings;

  const patch = (patch: Partial<typeof extended>) => {
    settings.patchExtendedSettings(patch);
  };

  const handleLaunchAtLogin = (checked: boolean) => {
    setLaunchAtLogin(checked);
    void window.api?.desktop?.setAutostart?.(checked);
  };

  const handleAutoCheckUpdates = (checked: boolean) => {
    patch({ autoCheckUpdates: checked });
    if (checked) {
      void app.updater?.startAutoChecker();
    } else {
      app.updater?.stopAutoChecker();
    }
  };

  const screenShareLabel = (value: string) => {
    const key = {
      "720p15": "desktop.screenShareQuality720p15",
      "720p30": "desktop.screenShareQuality720p30",
      "1080p30": "desktop.screenShareQuality1080p30",
      "1080p60": "desktop.screenShareQuality1080p60",
      source: "desktop.screenShareQualitySource"
    }[value];
    return key ? t(key) : value;
  };

  return (
    <Stack spacing={7.5} pt={2.5} pb={5} direction="column">
      <SettingsSection title={t("desktop.title")}>
        <SettingsToggleRow
          title={t("desktop.launchAtLogin")}
          description={t("desktop.launchAtLoginDescription")}
          checked={launchAtLogin}
          onChange={handleLaunchAtLogin}
        />

        <Stack spacing={1.25} direction="column">
          <Stack direction="column" spacing={0.5}>
            <Typography level="body-md" fontWeight="bold">
              {t("desktop.badgeColor")}
            </Typography>
            <Typography level="body-sm" textColor="muted">
              {t("desktop.badgeColorDescription")}
            </Typography>
          </Stack>
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            {BADGE_COLOR_PRESETS.map((color) => (
              <Stack
                key={color}
                as="button"
                onClick={() => app.setBadgeColor(color)}
                alignItems="center"
                justifyContent="center"
                css={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "50%",
                  background: color,
                  border:
                    app.badgeColor === color
                      ? `3px solid ${formatColor(theme.colors.neutral, {
                          alpha: 30,
                          format: "hexa"
                        })}`
                      : "2px solid transparent",
                  cursor: "pointer",
                  boxShadow:
                    app.badgeColor === color
                      ? `0 0 0 2px ${theme.colors.primary}`
                      : undefined
                }}
              />
            ))}
          </Stack>
        </Stack>

        <SettingsToggleRow
          title={t("desktop.screenShareIncludeAudio")}
          description={t("desktop.screenShareIncludeAudioDescription")}
          checked={settings.screenShareIncludeAudio}
          onChange={(checked) => {
            settings.setScreenShareIncludeAudio(checked);
          }}
        />

        <SettingsSelectField
          title={t("desktop.screenShareQuality")}
          description={t("desktop.screenShareQualityDescription")}
          value={settings.screenShareQuality}
          onChange={(value) => {
            settings.setScreenShareQuality(
              value as typeof settings.screenShareQuality
            );
          }}
          options={SCREEN_SHARE_QUALITY_OPTIONS.map((option) => ({
            value: option.value,
            label: screenShareLabel(option.value)
          }))}
        />

        <SettingsToggleRow
          title={t("desktop.autoCheckUpdates")}
          description={t("desktop.autoCheckUpdatesDescription")}
          checked={extended.autoCheckUpdates}
          onChange={handleAutoCheckUpdates}
        />

        <SettingsToggleRow
          title={t("desktop.shareRpcPresence")}
          description={t("desktop.shareRpcPresenceDescription")}
          checked={extended.shareRpcPresence}
          onChange={(checked) => patch({ shareRpcPresence: checked })}
        />
      </SettingsSection>
    </Stack>
  );
});
