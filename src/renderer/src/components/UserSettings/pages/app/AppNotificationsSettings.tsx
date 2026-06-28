import { observer } from "mobx-react-lite";
import { Divider, Option, Select, Stack, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { IDLE_THRESHOLD_OPTIONS } from "@utils/statusDurations";
import { isElectron } from "@utils/index";

export const AppNotificationsSettings = observer(() => {
  const app = useAppStore();
  const settings = app.settings;

  if (!settings) return null;

  return (
    <Stack spacing={25} mt={7.5} mx={50} direction="column">
      <Stack spacing={2.5} direction="column">
        <Typography fontSize={20}>Presence</Typography>
        <Divider textColor="muted" css={{ opacity: 0.5 }} />

        {isElectron ? (
          <Paper variant="outlined" borderRadius={10} py={2.5} px={4} spacing={2.5} direction="column">
            <Stack direction="column" spacing={0.5}>
              <Typography level="body-md" fontWeight="bold">
                Idle timeout
              </Typography>
              <Typography level="body-sm" textColor="muted">
                Automatically mark yourself as idle after this long without keyboard or mouse input
              </Typography>
            </Stack>
            <Select
              value={String(settings.idleThresholdMs)}
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
      </Stack>
    </Stack>
  );
});
