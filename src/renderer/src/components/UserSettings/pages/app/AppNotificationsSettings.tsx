import { observer } from "mobx-react-lite";
import { Divider, Option, Select, Stack, Switch, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { IDLE_THRESHOLD_OPTIONS } from "@utils/statusDurations";
import { isElectron } from "@utils/index";

export const AppNotificationsSettings = observer(() => {
  const app = useAppStore();
  const settings = app.settings;

  if (!settings) return null;

  const sync = () => {
    void settings.sync();
  };

  return (
    <Stack spacing={25} mt={7.5} mx={50} direction="column">
      <Stack spacing={2.5} direction="column">
        <Typography fontSize={20}>Push notifications</Typography>
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
            Push notifications are delivered to the mobile app when you are idle
            or offline. These settings sync across your devices.
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="column" spacing={0.5}>
              <Typography level="body-md" fontWeight="bold">
                Enable push notifications
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
                Direct messages
              </Typography>
              <Typography level="body-sm" textColor="muted">
                Includes group direct messages
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
                Mentions
              </Typography>
              <Typography level="body-sm" textColor="muted">
                Includes @user, @role, @everyone, and @here
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
        <Typography fontSize={20}>Presence</Typography>
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
                Idle timeout
              </Typography>
              <Typography level="body-sm" textColor="muted">
                Automatically mark yourself as idle after this long without
                keyboard or mouse input
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
                  {option.label}
                </Option>
              ))}
            </Select>
          </Paper>
        ) : (
          <Typography level="body-sm" textColor="muted">
            Idle detection is only available in the desktop app.
          </Typography>
        )}

        <Typography level="body-sm" textColor="muted">
          Do Not Disturb and Invisible always suppress push notifications.
        </Typography>
      </Stack>
    </Stack>
  );
});
