import { observer } from "mobx-react-lite";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { IconButton } from "@components/IconButton";
import { ClearActivityHistoryConfirm } from "@components/Modals/ClearActivityHistoryConfirm";
import {
  SettingsActionRow,
  SettingsSection,
  SettingsSelectField,
  SettingsToggleRow
} from "@components/UserSettings/SettingsField";
import { IDLE_THRESHOLD_OPTIONS } from "@mutualzz/client";
import { isElectron } from "@utils/index";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useModal } from "@contexts/Modal.context";
import { SpeakerHighIcon } from "@phosphor-icons/react";
import type { SoundToggleId } from "@renderer/utils/soundToggles";

export const AppNotificationsSettings = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const settings = app.settings;
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  if (!settings) return null;

  const sync = () => {
    void settings.sync();
  };

  const clearHistory = async () => {
    try {
      await app.rest.delete("/@me/activity-history");
      await queryClient.invalidateQueries({
        queryKey: ["user-recent-activities"]
      });
      toast.success(t("notifications.clearRecentActivityDone"));
    } catch {
      toast.error(t("notifications.clearRecentActivityError"));
      throw new Error("clear failed");
    }
  };

  return (
    <Stack spacing={7.5} pt={2.5} pb={5} direction="column">
      <SettingsSection
        title={t("notifications.pushTitle")}
        description={t("notifications.pushDescriptionDesktop")}
      >
        <SettingsToggleRow
          title={t("notifications.enablePush")}
          checked={settings.pushEnabled}
          onChange={(checked) => {
            settings.setPushEnabled(checked);
            sync();
          }}
        />

        <SettingsToggleRow
          title={t("notifications.directMessages")}
          description={t("notifications.directMessagesDescription")}
          checked={settings.pushDirectMessages}
          disabled={!settings.pushEnabled}
          onChange={(checked) => {
            settings.setPushDirectMessages(checked);
            sync();
          }}
        />

        <SettingsToggleRow
          title={t("notifications.mentions")}
          description={t("notifications.mentionsDescription")}
          checked={settings.pushMentions}
          disabled={!settings.pushEnabled}
          onChange={(checked) => {
            settings.setPushMentions(checked);
            sync();
          }}
        />
      </SettingsSection>

      <SettingsSection
        title={t("notifications.soundsTitle")}
        description={t("notifications.soundsDescription")}
      >
        <SettingsToggleRow
          title={t("notifications.soundsEnable")}
          checked={app.sounds.enabled}
          onChange={(checked) => app.sounds.setEnabled(checked)}
        />

        {(
          [
            "message",
            "call_incoming",
            "call_outgoing",
            "call_connect",
            "call_disconnect",
            "call_decline",
            "user_join",
            "user_leave",
            "mute",
            "deafen",
            "ptt",
            "stream"
          ] as SoundToggleId[]
        ).map((id) => (
          <SettingsToggleRow
            key={id}
            title={t(`notifications.sounds.${id}`)}
            checked={app.sounds.isToggleEnabled(id)}
            disabled={!app.sounds.enabled}
            onChange={(checked) => app.sounds.setToggle(id, checked)}
            beforeSwitch={
              <IconButton
                size="sm"
                variant="plain"
                aria-label={t("notifications.soundsPreview")}
                onClick={() => app.sounds.preview(id)}
              >
                <SpeakerHighIcon size={18} weight="fill" />
              </IconButton>
            }
          />
        ))}

        <Typography level="body-sm" textColor="muted">
          {t("notifications.soundsDndNote")}
        </Typography>
      </SettingsSection>

      <SettingsSection title={t("notifications.presenceTitle")}>
        <SettingsToggleRow
          title={t("notifications.shareActivity")}
          description={t("notifications.shareActivityDescription")}
          checked={settings.shareActivity}
          onChange={(checked) => {
            settings.setShareActivity(checked);
            sync();
          }}
        />

        <SettingsToggleRow
          title={t("notifications.shareRecentActivity")}
          description={t("notifications.shareRecentActivityDescription")}
          checked={settings.shareRecentActivity}
          onChange={(checked) => {
            settings.setShareRecentActivity(checked);
            sync();
            void queryClient.invalidateQueries({
              queryKey: ["user-recent-activities"]
            });
          }}
        />

        <SettingsActionRow
          title={t("notifications.clearRecentActivity")}
          description={t("notifications.clearRecentActivityDescription")}
          actionLabel={t("notifications.clearRecentActivityAction")}
          actionColor="danger"
          onClick={() =>
            openModal(
              "clear-activity-history",
              <ClearActivityHistoryConfirm onConfirm={clearHistory} />
            )
          }
        />

        {isElectron ? (
          <SettingsSelectField
            title={t("notifications.idleTimeout")}
            description={t("notifications.idleTimeoutDescription")}
            value={settings.idleThresholdMs.toString()}
            onChange={(value) => {
              const ms = Number(value);
              settings.setIdleThresholdMs(ms);
              window.api.idle.setThreshold(ms);
            }}
            options={IDLE_THRESHOLD_OPTIONS.map((option) => ({
              value: String(option.ms),
              label: tCommon(option.labelKey, { count: option.count })
            }))}
          />
        ) : (
          <Typography level="body-sm" textColor="muted">
            {t("notifications.idleDesktopOnly")}
          </Typography>
        )}

        <Typography level="body-sm" textColor="muted">
          {t("notifications.dndSuppressNote")}
        </Typography>
      </SettingsSection>
    </Stack>
  );
});
