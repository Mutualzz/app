import { observer } from "mobx-react-lite";
import {
  Divider,
  Option,
  Select,
  Stack,
  Switch,
  Typography
} from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { ClearActivityHistoryConfirm } from "@components/Modals/ClearActivityHistoryConfirm";
import { IDLE_THRESHOLD_OPTIONS } from "@utils/statusDurations";
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
      <Stack spacing={2.5} direction="column">
        <Typography fontSize={20}>{t("notifications.pushTitle")}</Typography>
        <Divider textColor="muted" css={{ opacity: 0.5 }} />

        <Paper
          variant="outlined"
          borderRadius={10}
          py={2.5}
          px={4}
          spacing={2.5}
          direction="column"
        >
          <Typography level="body-sm" textColor="muted">
            {t("notifications.pushDescriptionDesktop")}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="column" spacing={0.5}>
              <Typography level="body-md" fontWeight="bold">
                {t("notifications.enablePush")}
              </Typography>
            </Stack>
            <Switch
              checked={settings.pushEnabled}
              onChange={(e) => {
                settings.setPushEnabled(e.target.checked);
                sync();
              }}
            />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="column" spacing={0.5}>
              <Typography level="body-md" fontWeight="bold">
                {t("notifications.directMessages")}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {t("notifications.directMessagesDescription")}
              </Typography>
            </Stack>
            <Switch
              checked={settings.pushDirectMessages}
              disabled={!settings.pushEnabled}
              onChange={(e) => {
                settings.setPushDirectMessages(e.target.checked);
                sync();
              }}
            />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="column" spacing={0.5}>
              <Typography level="body-md" fontWeight="bold">
                {t("notifications.mentions")}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {t("notifications.mentionsDescription")}
              </Typography>
            </Stack>
            <Switch
              checked={settings.pushMentions}
              disabled={!settings.pushEnabled}
              onChange={(e) => {
                settings.setPushMentions(e.target.checked);
                sync();
              }}
            />
          </Stack>
        </Paper>
      </Stack>

      <Stack spacing={2.5} direction="column">
        <Typography fontSize={20}>{t("notifications.soundsTitle")}</Typography>
        <Divider textColor="muted" css={{ opacity: 0.5 }} />

        <Paper
          variant="outlined"
          borderRadius={10}
          py={2.5}
          px={4}
          spacing={2.5}
          direction="column"
        >
          <Typography level="body-sm" textColor="muted">
            {t("notifications.soundsDescription")}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="column" spacing={0.5}>
              <Typography level="body-md" fontWeight="bold">
                {t("notifications.soundsEnable")}
              </Typography>
            </Stack>
            <Switch
              checked={app.sounds.enabled}
              onChange={(e) => {
                app.sounds.setEnabled(e.target.checked);
              }}
            />
          </Stack>

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
            <Stack
              key={id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="column" spacing={0.5} minWidth={0} flex={1}>
                <Typography level="body-md" fontWeight="bold">
                  {t(`notifications.sounds.${id}`)}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  size="sm"
                  variant="plain"
                  aria-label={t("notifications.soundsPreview")}
                  onClick={() => app.sounds.preview(id)}
                >
                  <SpeakerHighIcon size={18} weight="fill" />
                </IconButton>
                <Switch
                  checked={app.sounds.isToggleEnabled(id)}
                  disabled={!app.sounds.enabled}
                  onChange={(e) => {
                    app.sounds.setToggle(id, e.target.checked);
                  }}
                />
              </Stack>
            </Stack>
          ))}
        </Paper>

        <Typography level="body-sm" textColor="muted">
          {t("notifications.soundsDndNote")}
        </Typography>
      </Stack>

      <Stack spacing={2.5} direction="column">
        <Typography fontSize={20}>
          {t("notifications.presenceTitle")}
        </Typography>
        <Divider textColor="muted" css={{ opacity: 0.5 }} />

        <Paper
          variant="outlined"
          borderRadius={10}
          py={2.5}
          px={4}
          spacing={2.5}
          direction="column"
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="column" spacing={0.5}>
              <Typography level="body-md" fontWeight="bold">
                {t("notifications.shareActivity")}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {t("notifications.shareActivityDescription")}
              </Typography>
            </Stack>
            <Switch
              checked={settings.shareActivity}
              onChange={(e) => {
                settings.setShareActivity(e.target.checked);
                sync();
              }}
            />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="column" spacing={0.5}>
              <Typography level="body-md" fontWeight="bold">
                {t("notifications.shareRecentActivity")}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {t("notifications.shareRecentActivityDescription")}
              </Typography>
            </Stack>
            <Switch
              checked={settings.shareRecentActivity}
              onChange={(e) => {
                settings.setShareRecentActivity(e.target.checked);
                sync();
                void queryClient.invalidateQueries({
                  queryKey: ["user-recent-activities"]
                });
              }}
            />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="column" spacing={0.5}>
              <Typography level="body-md" fontWeight="bold">
                {t("notifications.clearRecentActivity")}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {t("notifications.clearRecentActivityDescription")}
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              color="danger"
              size="sm"
              onClick={() =>
                openModal(
                  "clear-activity-history",
                  <ClearActivityHistoryConfirm onConfirm={clearHistory} />
                )
              }
            >
              {t("notifications.clearRecentActivityAction")}
            </Button>
          </Stack>

          {isElectron ? (
            <>
              <Stack direction="column" spacing={0.5}>
                <Typography level="body-md" fontWeight="bold">
                  {t("notifications.idleTimeout")}
                </Typography>
                <Typography level="body-sm" textColor="muted">
                  {t("notifications.idleTimeoutDescription")}
                </Typography>
              </Stack>
              <Select
                value={settings.idleThresholdMs.toString()}
                onValueChange={(value) => {
                  if (typeof value !== "string") return;
                  const ms = Number(value);
                  settings.setIdleThresholdMs(ms);
                  window.api.idle.setThreshold(ms);
                }}
              >
                {IDLE_THRESHOLD_OPTIONS.map((option) => (
                  <Option key={option.ms} value={String(option.ms)}>
                    {tCommon(option.labelKey, { count: option.count })}
                  </Option>
                ))}
              </Select>
            </>
          ) : (
            <Typography level="body-sm" textColor="muted">
              {t("notifications.idleDesktopOnly")}
            </Typography>
          )}
        </Paper>

        <Typography level="body-sm" textColor="muted">
          {t("notifications.dndSuppressNote")}
        </Typography>
      </Stack>
    </Stack>
  );
});
