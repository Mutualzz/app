import {
  SettingsActionRow,
  SettingsSection,
  SettingsSelectField,
  SettingsToggleRow
} from "@components/UserSettings/SettingsField";
import { useAppStore } from "@hooks/useStores";
import { uiDensityLabelKey } from "@mutualzz/client";
import {
  UI_DENSITY_OPTIONS,
  type UiDensity
} from "@mutualzz/types";
import { Stack } from "@mutualzz/ui-web";
import { applyMessageLayout } from "@utils/messageLayout";
import { applyUiDensity } from "@mutualzz/ui-core";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const AppAppearanceExtrasSettings = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const settings = app.settings;

  if (!settings) return null;

  const extended = settings.extendedSettings;

  const patch = (next: Partial<typeof extended>) => {
    settings.patchExtendedSettings(next);
  };

  const uiDensityLabel = (value: UiDensity) => t(uiDensityLabelKey(value));

  return (
    <Stack spacing={7.5} direction="column">
      <SettingsSection title={t("appearance.uiDensityTitle")}>
        <SettingsSelectField
          title={t("appearance.uiDensity")}
          description={t("appearance.uiDensityDescription")}
          value={extended.uiDensity}
          onChange={(value) => {
            const uiDensity = value as UiDensity;
            applyUiDensity(uiDensity);
            applyMessageLayout(
              extended.messageDisplay ?? "default",
              uiDensity,
            );
            patch({ uiDensity });
          }}
          options={UI_DENSITY_OPTIONS.map((value) => ({
            value,
            label: uiDensityLabel(value)
          }))}
        />
      </SettingsSection>

      <SettingsSection title={t("layout.title")}>
        <SettingsToggleRow
          title={t("layout.defaultMemberListVisible")}
          description={t("layout.defaultMemberListVisibleDescription")}
          checked={extended.defaultMemberListVisible}
          onChange={(checked) => {
            patch({ defaultMemberListVisible: checked });
            app.setMemberListVisible(checked);
          }}
        />

        <SettingsActionRow
          title={t("layout.resetChannelListWidth")}
          description={t("layout.resetChannelListWidthDescription")}
          actionLabel={t("layout.resetChannelListWidthAction")}
          onClick={() => app.resetChannelListWidth()}
        />

        <SettingsActionRow
          title={t("layout.resetDmChannelListWidth")}
          description={t("layout.resetDmChannelListWidthDescription")}
          actionLabel={t("layout.resetDmChannelListWidthAction")}
          onClick={() => app.resetDmChannelListWidth()}
        />

        <SettingsActionRow
          title={t("layout.resetCollapsedCategories")}
          description={t("layout.resetCollapsedCategoriesDescription")}
          actionLabel={t("layout.resetCollapsedCategoriesAction")}
          onClick={() => app.resetCollapsedCategories()}
        />

        <SettingsActionRow
          title={t("layout.resetSpaceOrder")}
          description={t("layout.resetSpaceOrderDescription")}
          actionLabel={t("layout.resetSpaceOrderAction")}
          onClick={() => settings.resetSpaceOrder()}
        />

        <SettingsToggleRow
          title={t("privacy.dontShowLinkWarning")}
          description={t("privacy.dontShowLinkWarningDescription")}
          checked={app.dontShowLinkWarning}
          onChange={(checked) => app.setDontShowLinkWarning(checked)}
        />
      </SettingsSection>

      <SettingsSection title={t("accessibility.title")}>
        <SettingsToggleRow
          title={t("accessibility.reducedMotion")}
          description={t("accessibility.reducedMotionDescription")}
          checked={extended.reducedMotion}
          onChange={(checked) => patch({ reducedMotion: checked })}
        />

        <SettingsToggleRow
          title={t("accessibility.highContrast")}
          description={t("accessibility.highContrastDescription")}
          checked={extended.highContrast}
          onChange={(checked) => patch({ highContrast: checked })}
        />
      </SettingsSection>
    </Stack>
  );
});
