import { observer } from "mobx-react-lite";
import type { PresencePayload } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { CustomStatusDisplay } from "@components/CustomStatus/CustomStatusDisplay";
import { PresenceIcon } from "./Presence/PresenceIcon";

interface Props {
  presence?: PresencePayload;
  vertical?: boolean;
  hideCustomStatus?: boolean;
}

export const SmallActivityStatus = observer(
  ({ presence, vertical, hideCustomStatus = false }: Props) => {
    const { theme } = useTheme();
    const color = theme.colors.success;

    if (!presence) return null;

    const activity = Array.isArray(presence.activities)
      ? (presence.activities[0] ?? null)
      : null;

    if (!activity) return null;

    if (activity.type === "custom" && !hideCustomStatus) {
      return (
        <Stack
          direction={vertical ? "column" : "row"}
          spacing={0.5}
          minWidth={0}
        >
          <CustomStatusDisplay activity={activity} fontSize={12} />
          {!vertical && presence.activities.length > 1 && (
            <Typography level="label-xs" textColor="accent">
              +{presence.activities.length - 1}
            </Typography>
          )}
        </Stack>
      );
    }

    return (
      <Stack
        direction={vertical ? "column" : "row"}
        alignItems="center"
        spacing={0.5}
      >
        <Stack direction={vertical ? "column" : "row"} alignItems="center">
          <PresenceIcon color={color} type={activity.type} />
          <Typography level="label-xs" textColor={color}>
            {presence.activities.length > 1
              ? `+${presence.activities.length - 1}`
              : ""}
          </Typography>
        </Stack>
        {!vertical && `•`}
        <Typography level="label-xs" textColor="accent">
          {activity.name}
        </Typography>
      </Stack>
    );
  }
);
