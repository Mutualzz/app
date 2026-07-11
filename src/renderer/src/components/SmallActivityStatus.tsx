import { observer } from "mobx-react-lite";
import type { PresencePayload } from "@mutualzz/types";
import { presenceStatusKeys } from "@mutualzz/i18n";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { CustomStatusDisplay } from "@components/CustomStatus/CustomStatusDisplay";
import { useTranslation } from "react-i18next";
import { PresenceIcon } from "./Presence/PresenceIcon";

interface Props {
  presence?: PresencePayload;
  vertical?: boolean;
  hideCustomStatus?: boolean;
  showStatus?: boolean;
}

export const SmallActivityStatus = observer(
  ({
    presence,
    vertical,
    hideCustomStatus = false,
    showStatus = false
  }: Props) => {
    const { theme } = useTheme();
    const { t } = useTranslation("common");
    const color = theme.colors.success;

    if (!presence) return null;

    const activity = Array.isArray(presence.activities)
      ? (presence.activities[0] ?? null)
      : null;

    const statusKey =
      presence.status === "online" ||
      presence.status === "idle" ||
      presence.status === "dnd"
        ? presenceStatusKeys[presence.status]
        : null;
    const status = statusKey ? t(statusKey) : null;

    if (!activity && showStatus)
      return (
        <Typography fontSize={12} textColor="accent">
          {status}
        </Typography>
      );

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
