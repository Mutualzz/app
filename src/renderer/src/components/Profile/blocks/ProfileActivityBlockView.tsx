import { useAppStore } from "@hooks/useStores";
import type { ProfileActivityBlock } from "@mutualzz/types";
import type { Snowflake } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { CustomStatusDisplay } from "@components/CustomStatus/CustomStatusDisplay";
import { PulseIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { PresenceIcon } from "@renderer/components/Presence/PresenceIcon";
import { Paper } from "@renderer/components/Paper";

interface Props {
  block: ProfileActivityBlock;
  userId: Snowflake;
}

export const ProfileActivityBlockView = observer(({ block, userId }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const presence = app.presence.get(userId);
  const otherActivities = presence?.activities?.filter(
    (a) => a.type !== "custom"
  );
  const customActivity = presence?.activities?.find((a) => a.type === "custom");

  return (
    <Paper
      direction="column"
      spacing={1}
      width="100%"
      height="100%"
      p={1.5}
      borderRadius={12}
      elevation={app.settings?.preferEmbossed ? 5 : 2}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <PulseIcon size={18} weight="fill" />
        <Typography level="body-sm" fontWeight={700}>
          Activity
        </Typography>
      </Stack>

      {presence?.status && (
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          flexWrap="wrap"
        >
          <Typography
            level="body-xs"
            css={{ opacity: 0.75, textTransform: "capitalize" }}
          >
            {presence.status}
          </Typography>
          {customActivity && block.showCustomStatus && (
            <>
              <Typography level="body-xs" css={{ opacity: 0.5 }}>
                —
              </Typography>
              <CustomStatusDisplay
                activity={customActivity}
                fontSize={12}
                textColor="primary"
              />
            </>
          )}
          {otherActivities?.map((activity) => (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PresenceIcon
                key={activity.name}
                type={activity.type}
                color={theme.colors.success}
              />
              <Typography level="body-xs" textColor="accent">
                {activity.name}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );
});
