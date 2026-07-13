import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { useAppStore } from "@hooks/useStores";
import { Popover, Stack, Switch, Typography, useTheme } from "@mutualzz/ui-web";
import { WaveformIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const NoiseSuppressionPopover = observer(() => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const settings = app.settings;
  const pending = app.voice.noiseSuppressionPending;
  const enabled = settings?.noiseSuppression !== false;

  if (!settings) return null;

  return (
    <Popover
      placement="top"
      closeOnInteract={false}
      elevation={app.settings?.preferEmbossed ? 5 : 2}
      p={2.5}
      css={{
        width: "18rem",
        maxWidth: "18rem",
        whiteSpace: "normal"
      }}
      trigger={
        <Tooltip
          content={
            enabled
              ? t("voice.controls.noiseSuppressionOn")
              : t("voice.controls.noiseSuppressionOff")
          }
          placement="top"
        >
          <IconButton
            aria-label={t("voice.controls.noiseSuppressionA11y")}
            disabled={pending}
          >
            <WaveformIcon
              weight="fill"
              color={
                enabled ? theme.colors.success : theme.typography.colors.muted
              }
            />
          </IconButton>
        </Tooltip>
      }
    >
      <Stack direction="column" spacing={1.5} width="100%">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          width="100%"
        >
          <Typography level="body-sm" textColor="muted">
            {t("voice.controls.noiseSuppression")}
          </Typography>
          <Switch
            checked={enabled}
            disabled={pending}
            onChange={() => settings.setNoiseSuppression(!enabled)}
          />
        </Stack>
        <Typography
          level="body-xs"
          css={{
            whiteSpace: "normal",
            wordBreak: "break-word"
          }}
        >
          {pending
            ? t("voice.controls.noiseSuppressionApplying")
            : t("voice.controls.noiseSuppressionDescription")}
        </Typography>
      </Stack>
    </Popover>
  );
});
