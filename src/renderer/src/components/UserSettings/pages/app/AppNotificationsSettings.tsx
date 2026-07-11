import { observer } from "mobx-react-lite";
import { Divider, Option, Select, Stack, Switch, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { IDLE_THRESHOLD_OPTIONS } from "@utils/statusDurations";
import { isElectron } from "@utils/index";
import { useTranslation } from "react-i18next";

export const AppNotificationsSettings = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const settings = app.settings;

  if (!settings) return null;

  const sync = () => {
    void settings.sync();
  };

  return (
    <Stack spacing={25} mt={7.5} mx={50} direction="column">
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

          <Stack direction="row" alignItems="center" justifyContent="space-between">
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

          <Stack direction="row" alignItems="center" justifyContent="space-between">
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

          <Stack direction="row" alignItems="center" justifyContent="space-between">
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
        <Typography fontSize={20}>{t("notifications.presenceTitle")}</Typography>
        <Divider textColor="muted" css={{ opacity: 0.5 }} />

        {isElectron ? (
          <Paper
            variant="outlined"
            borderRadius={10}
            py={2.5}
            px={4}
            spacing={2.5}
            direction="column"
          >
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
          </Paper>
        ) : (
          <Typography level="body-sm" textColor="muted">
            {t("notifications.idleDesktopOnly")}
          </Typography>
        )}

        <Typography level="body-sm" textColor="muted">
          {t("notifications.dndSuppressNote")}
        </Typography>
      </Stack>
    </Stack>
  );
});
